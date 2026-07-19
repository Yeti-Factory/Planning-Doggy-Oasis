import { createClient } from 'npm:@supabase/supabase-js@2'

const BACKUP_TABLES = [
  'people',
  'planning_assignments',
  'annual_events',
  'weekly_tasks',
  'custom_tasks',
  'settings',
  'rest_days',
] as const

interface BackupResult {
  storage: boolean
  onedrive: boolean | 'skipped'
  errors: string[]
}

function jsonResponse(body: unknown, status: number): Response {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim()
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

async function sha256(value: string): Promise<Uint8Array> {
  const bytes = new TextEncoder().encode(value)
  return new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))
}

async function secretsMatch(received: string, expected: string): Promise<boolean> {
  const [receivedHash, expectedHash] = await Promise.all([sha256(received), sha256(expected)])
  let difference = 0
  for (let index = 0; index < receivedHash.length; index += 1) {
    difference |= receivedHash[index] ^ expectedHash[index]
  }
  return difference === 0
}

function getBearerToken(request: Request): string {
  const authorization = request.headers.get('Authorization') ?? ''
  return authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : ''
}

function encodeSharingUrl(sharingUrl: string): string {
  const base64 = btoa(sharingUrl)
    .replace(/=+$/, '')
    .replace(/\//g, '_')
    .replace(/\+/g, '-')
  return `u!${base64}`
}

async function getMicrosoftAccessToken(
  tenantId: string,
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://graph.microsoft.com/.default',
    }),
  })

  if (!response.ok) throw new Error(`Microsoft token request failed (${response.status})`)

  const data: unknown = await response.json()
  if (
    !data ||
    typeof data !== 'object' ||
    !('access_token' in data) ||
    typeof data.access_token !== 'string'
  ) {
    throw new Error('Microsoft token response did not contain an access token')
  }
  return data.access_token
}

async function resolveShareFolder(
  accessToken: string,
  shareId: string,
): Promise<{ driveId: string; folderId: string }> {
  const response = await fetch(`https://graph.microsoft.com/v1.0/shares/${shareId}/driveItem`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) throw new Error(`SharePoint folder resolution failed (${response.status})`)

  const item: unknown = await response.json()
  if (
    !item ||
    typeof item !== 'object' ||
    !('id' in item) ||
    typeof item.id !== 'string' ||
    !('parentReference' in item) ||
    !item.parentReference ||
    typeof item.parentReference !== 'object' ||
    !('driveId' in item.parentReference) ||
    typeof item.parentReference.driveId !== 'string'
  ) {
    throw new Error('SharePoint response did not contain the expected folder identifiers')
  }

  return { driveId: item.parentReference.driveId, folderId: item.id }
}

async function uploadToOneDrive(
  accessToken: string,
  driveId: string,
  folderId: string,
  fileName: string,
  content: string,
): Promise<void> {
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${folderId}:/${fileName}:/content`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: content,
    },
  )

  if (!response.ok) throw new Error(`OneDrive upload failed (${response.status})`)
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  let invokeSecret: string
  try {
    invokeSecret = getRequiredEnv('BACKUP_INVOKE_SECRET')
  } catch (error) {
    console.error(errorMessage(error))
    return jsonResponse({ error: 'Backup service is not configured' }, 503)
  }

  if (!(await secretsMatch(getBearerToken(request), invokeSecret))) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  const results: BackupResult = {
    storage: false,
    onedrive: 'skipped',
    errors: [],
  }

  try {
    const supabaseAdmin = createClient(
      getRequiredEnv('SUPABASE_URL'),
      getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { persistSession: false, autoRefreshToken: false } },
    )

    const backupData: Record<string, unknown> = {
      metadata: {
        schemaVersion: 1,
        createdAt: new Date().toISOString(),
        tables: BACKUP_TABLES,
      },
    }

    for (const table of BACKUP_TABLES) {
      const { data, error } = await supabaseAdmin.from(table).select('*')
      if (error) throw new Error(`Unable to export ${table}: ${error.message}`)
      backupData[table] = data
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `planning-doggy-oasis-${timestamp}.json`
    const fileContent = JSON.stringify(backupData, null, 2)

    try {
      const { error: uploadError } = await supabaseAdmin.storage
        .from('backups')
        .upload(fileName, fileContent, {
          contentType: 'application/json',
          upsert: false,
        })

      if (uploadError) throw uploadError
      results.storage = true
      console.log(`Storage backup created: ${fileName}`)
    } catch (error) {
      const message = errorMessage(error)
      results.errors.push(`Storage: ${message}`)
      console.error('Storage backup failed:', message)
    }

    const tenantId = Deno.env.get('AZURE_TENANT_ID')?.trim()
    const clientId = Deno.env.get('AZURE_CLIENT_ID')?.trim()
    const clientSecret = Deno.env.get('AZURE_CLIENT_SECRET')?.trim()
    const shareLink = Deno.env.get('ONEDRIVE_BACKUP_LINK')?.trim()
    const oneDriveValues = [tenantId, clientId, clientSecret, shareLink]

    if (oneDriveValues.some(Boolean) && !oneDriveValues.every(Boolean)) {
      results.errors.push('OneDrive: configuration is incomplete')
    } else if (tenantId && clientId && clientSecret && shareLink) {
      try {
        const accessToken = await getMicrosoftAccessToken(tenantId, clientId, clientSecret)
        const { driveId, folderId } = await resolveShareFolder(accessToken, encodeSharingUrl(shareLink))
        await uploadToOneDrive(accessToken, driveId, folderId, fileName, fileContent)
        results.onedrive = true
        console.log(`OneDrive backup uploaded: ${fileName}`)
      } catch (error) {
        const message = errorMessage(error)
        results.onedrive = false
        results.errors.push(`OneDrive: ${message}`)
        console.error('OneDrive backup failed:', message)
      }
    }

    const success = results.storage || results.onedrive === true
    return jsonResponse({ success, fileName, ...results }, success ? 200 : 500)
  } catch (error) {
    console.error('Backup failed:', errorMessage(error))
    return jsonResponse({ error: 'Backup failed' }, 500)
  }
})
