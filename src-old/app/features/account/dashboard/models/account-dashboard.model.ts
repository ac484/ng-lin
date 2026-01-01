export interface AccountDashboard {
  id: string;
  namespacePath: string;
  summary?: string;
  recentActivity?: string[];
  updatedAt?: Date | null;
}
