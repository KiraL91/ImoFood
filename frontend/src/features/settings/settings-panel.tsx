import { UsersSettings } from "@/features/settings/users-settings";
import { UserProfileSettings } from "@/features/settings/user-profile-settings";

export function SettingsPanel() {
  return (
    <div className="space-y-8">
      <UserProfileSettings />

      <UsersSettings />
    </div>
  );
}
