export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
          Settings
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Manage your application settings
        </p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-black dark:text-zinc-50">
            General Settings
          </h2>
          <div className="space-y-4">
            <SettingItem
              label="Site Name"
              description="The name of your application"
              value="My Application"
            />
            <SettingItem
              label="Site URL"
              description="The base URL of your application"
              value="https://example.com"
            />
            <SettingItem
              label="Timezone"
              description="Default timezone for the application"
              value="UTC"
            />
          </div>
        </div>

        {/* Security Settings */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-black dark:text-zinc-50">
            Security Settings
          </h2>
          <div className="space-y-4">
            <ToggleSetting
              label="Two-Factor Authentication"
              description="Require 2FA for all admin users"
              enabled={true}
            />
            <ToggleSetting
              label="Session Timeout"
              description="Automatically log out inactive users after 30 minutes"
              enabled={true}
            />
            <ToggleSetting
              label="IP Whitelist"
              description="Only allow access from whitelisted IP addresses"
              enabled={false}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200">
            Save Changes
          </button>
          <button className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800">
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingItem({
  label,
  description,
  value,
}: {
  label: string;
  description: string;
  value: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-black dark:text-zinc-50">
        {label}
      </label>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
      <input
        type="text"
        defaultValue={value}
        className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
      />
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  enabled,
}: {
  label: string;
  description: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <label className="block text-sm font-medium text-black dark:text-zinc-50">
          {label}
        </label>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      </div>
      <button
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled
            ? "bg-black dark:bg-zinc-50"
            : "bg-zinc-200 dark:bg-zinc-800"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
