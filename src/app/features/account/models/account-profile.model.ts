export interface AccountProfile {
  id: string;
  displayName: string;
  namespacePath: string; // e.g., @username or @org
  avatarUrl?: string;
  bio?: string;
}
