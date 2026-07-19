export function hasLocalDataToMigrate(): boolean {
  if (localStorage.getItem('migration-done') === 'true') return false;

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key || key === 'migration-done') continue;

    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const state = parsed?.state || parsed;

      if (Array.isArray(state?.people) && state.people.length > 0) return true;
      if (Array.isArray(state?.customTasks) && state.customTasks.length > 0) return true;
      if (state?.settings && Object.keys(state.settings).length > 0) return true;
      if (state?.events && Object.keys(state.events).length > 0) return true;
      if (state?.assignments && Object.keys(state.assignments).length > 0) return true;
    } catch {
      // Ignore localStorage values that are unrelated to this application.
    }
  }

  return false;
}
