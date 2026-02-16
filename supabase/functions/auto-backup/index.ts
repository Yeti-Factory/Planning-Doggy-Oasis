import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const tables = ['people', 'planning_assignments', 'annual_events', 'weekly_tasks', 'custom_tasks', 'settings']
    const backupData: Record<string, any> = {}

    // 1. Fetch data from all tables
    for (const table of tables) {
      const { data, error } = await supabaseAdmin.from(table).select('*')
      if (error) throw new Error(`Error fetching ${table}: ${error.message}`)
      backupData[table] = data
    }

    // 2. Prepare file metadata
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `backup-${timestamp}.json`
    const fileContent = JSON.stringify(backupData, null, 2)

    // 3. Upload to storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('backups')
      .upload(fileName, fileContent, {
        contentType: 'application/json',
      })

    if (uploadError) throw uploadError

    console.log(`Successfully created backup: ${fileName}`)

    return new Response(
      JSON.stringify({ message: 'Backup created successfully', fileName }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Backup failed:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
