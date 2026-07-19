-- Run after deploying the auto-backup Edge Function and setting its secrets.
-- Replace the two placeholder values. Never commit the real values.

SELECT vault.create_secret(
  'https://YOUR_PROJECT_REF.supabase.co',
  'planning_project_url'
);

SELECT vault.create_secret(
  'YOUR_RANDOM_BACKUP_INVOKE_SECRET',
  'planning_backup_invoke_secret'
);

-- Daily at 02:00 UTC. Change the cron expression if required.
SELECT cron.schedule(
  'planning-doggy-oasis-daily-backup',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'planning_project_url')
      || '/functions/v1/auto-backup',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret
        FROM vault.decrypted_secrets
        WHERE name = 'planning_backup_invoke_secret'
      )
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Verification:
-- SELECT jobid, jobname, schedule, active FROM cron.job;
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
