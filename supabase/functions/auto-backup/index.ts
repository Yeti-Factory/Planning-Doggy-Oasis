import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function encodeSharingUrl(sharingUrl: string): string {
  const base64 = btoa(sharingUrl)
    .replace(/=+$/, '')
    .replace(/\//g, '_')
    .replace(/\+/g, '-')
  return `u!${base64}`
}

async function getMicrosoftAccessToken(tenantId: string, clientId: string, clientSecret: string): Promise<string> {
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default',
  })

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Microsoft token error: ${res.status} - ${text}`)
  }

  const data = await res.json()
  return data.access_token
}

async function resolveShareFolder(accessToken: string, shareId: string): Promise<{ driveId: string; folderId: string }> {
  const res = await fetch(`https://graph.microsoft.com/v1.0/shares/${shareId}/driveItem`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`SharePoint resolve error: ${res.status} - ${text}`)
  }

  const item = await res.json()
  return {
    driveId: item.parentReference.driveId,
    folderId: item.id,
  }
}

async function uploadToOneDrive(accessToken: string, driveId: string, folderId: string, fileName: string, content: string): Promise<void> {
  const uploadUrl = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${folderId}:/${fileName}:/content`

  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: content,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OneDrive upload error: ${res.status} - ${text}`)
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const results: { local: boolean; onedrive: boolean; errors: string[] } = {
    local: false,
    onedrive: false,
    errors: [],
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const tables = ['people', 'planning_assignments', 'annual_events', 'weekly_tasks', 'custom_tasks', 'settings']
    const backupData: Record<string, any> = {}

    for (const table of tables) {
      const { data, error } = await supabaseAdmin.from(table).select('*')
      if (error) throw new Error(`Error fetching ${table}: ${error.message}`)
      backupData[table] = data
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `backup-${timestamp}.json`
    const fileContent = JSON.stringify(backupData, null, 2)

    // 1. Local backup to storage bucket
    try {
      const { error: uploadError } = await supabaseAdmin.storage
        .from('backups')
        .upload(fileName, fileContent, { contentType: 'application/json' })

      if (uploadError) throw uploadError
      results.local = true
      console.log(`Local backup created: ${fileName}`)
    } catch (e) {
      results.errors.push(`Local: ${e.message}`)
      console.error('Local backup failed:', e.message)
    }

    // 2. OneDrive/SharePoint backup
    try {
      const tenantId = Deno.env.get('AZURE_TENANT_ID') ?? ''
      const clientId = Deno.env.get('AZURE_CLIENT_ID') ?? ''
      const clientSecret = Deno.env.get('AZURE_CLIENT_SECRET') ?? ''
      const shareLink = Deno.env.get('ONEDRIVE_BACKUP_LINK') ?? ''

      if (!tenantId || !clientId || !clientSecret || !shareLink) {
        throw new Error('Missing OneDrive configuration secrets')
      }

      const accessToken = await getMicrosoftAccessToken(tenantId, clientId, clientSecret)
      const shareId = encodeSharingUrl(shareLink)
      const { driveId, folderId } = await resolveShareFolder(accessToken, shareId)
      await uploadToOneDrive(accessToken, driveId, folderId, fileName, fileContent)

      results.onedrive = true
      console.log(`OneDrive backup uploaded: ${fileName}`)
    } catch (e) {
      results.errors.push(`OneDrive: ${e.message}`)
      console.error('OneDrive backup failed:', e.message)
    }

    const status = results.local || results.onedrive ? 200 : 500
    return new Response(
      JSON.stringify({ message: 'Backup completed', fileName, ...results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status }
    )
  } catch (error) {
    console.error('Backup failed:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
