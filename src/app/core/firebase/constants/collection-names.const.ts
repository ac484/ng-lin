// src/app/core/firebase/constants/collection-names.const.ts

export const FIREBASE_COLLECTIONS = {
  // 👤 Users & Accounts
  USERS: 'users',
  USER_PROFILES: 'user_profiles',
  ORGANIZATIONS: 'organizations',
  TEAMS: 'teams',

  // 📋 Blueprints
  BLUEPRINTS: 'blueprints',
  BLUEPRINT_ISSUES: 'blueprint_issues',
  BLUEPRINT_TASKS: 'blueprint_tasks',
  BLUEPRINT_DISCUSSIONS: 'blueprint_discussions',
  BLUEPRINT_WIKI: 'blueprint_wiki',

  // 🏷️ Work Management
  LABELS: 'labels',
  MILESTONES: 'milestones',
  PROJECTS: 'projects',
  EPICS: 'epics',

  // 🚀 Releases
  RELEASES: 'releases',
  CHANGELOGS: 'changelogs',

  // 📦 Packages
  PACKAGES: 'packages',
  PACKAGE_VERSIONS: 'package_versions',

  // 🔔 Notifications
  NOTIFICATIONS: 'notifications',
  NOTIFICATION_SETTINGS: 'notification_settings',

  // 💰 Sponsorship
  SPONSORS: 'sponsors',
  SPONSORSHIP_TIERS: 'sponsorship_tiers',

  // 📊 Analytics
  ACTIVITY_LOGS: 'activity_logs',
  PAGE_VIEWS: 'page_views',

  // 🔒 Security
  SECURITY_ADVISORIES: 'security_advisories',
  AUDIT_LOGS: 'audit_logs'
} as const;

export const FIREBASE_SUBCOLLECTIONS = {
  COMMENTS: 'comments',
  REACTIONS: 'reactions',
  ATTACHMENTS: 'attachments',
  MENTIONS: 'mentions',
  REFERENCES: 'references'
} as const;
