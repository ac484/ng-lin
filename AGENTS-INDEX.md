# AGENTS.md Index

**Purpose**: Quick reference for all AGENTS.md locations in the repository.

> **Note**: AI agents should follow `/AGENTS.md` navigation table. This is a human reference.

## Directory-to-AGENTS.md Map

| Directory | AGENTS.md Location |
|-----------|-------------------|
| `src/app/core/**` | `src/app/core/AGENTS.md` |
| `src/app/features/**` | `src/app/features/AGENTS.md` |
| `src/app/shared/**` | `src/app/shared/AGENTS.md` |
| `src/app/layout/**` | `src/app/layout/AGENTS.md` |
| `src/app/routes/**` | `src/app/routes/AGENTS.md` |
| `src/app/firebase/**` | `src/app/firebase/AGENTS.md` |
| `src/styles/**` | `src/styles/AGENTS.md` |
| `src/environments/**` | `src/environments/AGENTS.md` |

## Module-Specific Locations

### Core Modules
| Module | AGENTS.md |
|--------|-----------|
| `core/blueprint/**` | `core/blueprint/AGENTS.md` |
| `core/net/**` | `core/net/AGENTS.md` |

### Features
| Module | AGENTS.md |
|--------|-----------|
| `features/account/**` | `features/account/AGENTS.md` |
| `features/blueprint/**` | `features/blueprint/AGENTS.md` |
| `features/exception/**` | `features/exception/AGENTS.md` |
| `features/social/**` | `features/social/AGENTS.md` |

## Examples

### Editing a Blueprint Component
```
File: src/app/features/blueprint/components/list.component.ts
→ Read: src/app/features/blueprint/AGENTS.md
```

### Adding a Core Service  
```
File: src/app/core/services/permission.service.ts
→ Read: src/app/core/AGENTS.md
```

### Creating Account Route
```
File: src/app/features/account/routes/user/profile.page.ts
→ Read: src/app/features/account/routes/user/AGENTS.md
```
File: src/styles/theme.less
           ↓
        styles

→ Read: src/styles/AGENTS.md
→ Then: src/AGENTS.md (for global constraints)
```

## 📋 Complete File Hierarchy

```
/AGENTS.md                                          # Repository root
└── src/AGENTS.md                                   # Source root
    ├── environments/AGENTS.md                      # Environment config
    ├── styles/AGENTS.md                            # Global styles
    └── app/AGENTS.md                               # App root
        ├── core/AGENTS.md                          # Infrastructure
        │   ├── blueprint/AGENTS.md                 # Blueprint domain
        │   └── net/AGENTS.md                       # HTTP utilities
        ├── features/AGENTS.md                      # Business features
        │   ├── account/AGENTS.md                   # Account feature
        │   │   ├── dashboard/AGENTS.md             # Dashboard
        │   │   ├── profile/AGENTS.md               # Profile
        │   │   ├── settings/AGENTS.md              # Settings
        │   │   └── routes/AGENTS.md                # Account routes
        │   │       ├── _shared/AGENTS.md           # Shared utilities
        │   │       ├── admin/AGENTS.md             # Admin routes
        │   │       ├── organization/AGENTS.md      # Org routes
        │   │       ├── team/AGENTS.md              # Team routes
        │   │       └── user/AGENTS.md              # User routes
        │   ├── blueprint/AGENTS.md                 # Blueprint feature
        │   │   └── routes/AGENTS.md                # Blueprint routes
        │   │       └── modules/AGENTS.md           # Module views
        │   ├── exception/AGENTS.md                 # Error pages
        │   └── social/AGENTS.md                    # Social features
        ├── firebase/AGENTS.md                      # Firebase config
        ├── layout/AGENTS.md                        # App layout
        ├── routes/AGENTS.md                        # Routing
        ├── shared/AGENTS.md                        # Shared UI
        │   └── services/AGENTS.md                  # Business services
        └── [future modules as needed]

```

## 🚀 Quick Start for AI Agents

**When you receive a task:**

1. **Identify the file path** you'll be working on
2. **Use the tables above** to find the most specific AGENTS.md
3. **Read from specific to general**:
   - Start with the most specific module AGENTS.md
   - Then read parent AGENTS.md files
   - Stop when you have enough context
4. **Follow the rules** from all applicable AGENTS.md files

## 📝 Notes

- **Most specific wins**: If multiple AGENTS.md files apply, the most specific takes precedence
- **Cumulative rules**: All parent AGENTS.md rules still apply
- **Read hierarchy**: Always read child → parent when in doubt
- **Missing AGENTS.md**: If no specific AGENTS.md exists, use the parent module's file

---
**Last Updated**: 2025-12-25  
**Maintained by**: GigHub Development Team
