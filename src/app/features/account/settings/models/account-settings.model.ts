export interface AccountSettings {
  id: string;
  namespacePath: string;
  emailNotifications: boolean;
  language: string;
  theme?: 'light' | 'dark';
  updatedAt?: Date | null;
}
