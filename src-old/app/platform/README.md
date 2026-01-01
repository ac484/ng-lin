# Platform Layer

## Overview

The Platform Layer provides multi-tenant SaaS capabilities for ng-lin. It is distinct from the business domain (Task) and provides foundational entities for user management, organizations, teams, collaborators, and automation.

## Architecture Principles

### 1. Platform ≠ Domain
- Platform entities (User, Org, Team, Collaborator, Bot) are **infrastructure** for multi-tenancy
- Task is the **only business domain entity**
- Platform provides the "who" and "where", Task provides the "what"

### 2. Event-Driven Architecture
- All platform entities follow Event Sourcing patterns
- Events are the single source of truth
- State is derived from event replay
- Causality tracking ensures consistency

### 3. DDD Structure
Each platform entity follows consistent DDD structure:
```
entity/
├── events.ts       # Domain events (state changes)
├── decisions.ts    # Business rules (pure functions)
├── projections.ts  # Read models (derived from events)
├── commands.ts     # Intent to change state
├── models.ts       # Read-side data structures
└── index.ts        # Module exports
```

## Platform Entities

### User
- User account management
- Authentication state
- Profile information
- **Events**: UserCreated, UserUpdated, UserDeactivated
- **Decisions**: decideCanCreateUser, decideCanUpdateUser, decideCanDeactivateUser

### Organization
- Multi-tenant organization boundaries
- Ownership and membership
- **Events**: OrgCreated, OrgUpdated, OrgDeleted
- **Decisions**: decideCanCreateOrg, decideCanModifyOrg

### Team
- Sub-organization groupings
- Team-based access control
- **Events**: TeamCreated, TeamUpdated, TeamDeleted
- **Decisions**: decideCanCreateTeam, decideCanModifyTeam

### Collaborator
- Cross-entity collaboration
- Invitation and access management
- **Events**: CollaboratorInvited, CollaboratorAccepted, CollaboratorRemoved
- **Decisions**: decideCanInviteCollaborator, decideCanModifyCollaborator

### Bot
- Automation and integration accounts
- Bot actions and execution
- **Events**: BotCreated, BotUpdated, BotDisabled, BotActionExecuted
- **Decisions**: decideCanCreateBot, decideCanPerformBotAction

## Event Store

Platform events are stored separately from domain events:
- `PlatformEventStoreService` - Event persistence
- `PlatformEventPublisherService` - Event publication
- `PlatformEventSubscriberService` - Event consumption

## Processes

Cross-entity workflows (Sagas/Process Managers):

### CollaborationProcess
Orchestrates:
1. User invitation
2. Acceptance workflow
3. Permission assignment
4. Access revocation

### OnboardingProcess
Orchestrates:
1. Account creation
2. Profile setup
3. Organization/team assignment
4. Initial permissions

### TeamFormationProcess
Orchestrates:
1. Team creation
2. Member invitations
3. Role assignments
4. Workspace setup

## UI Components

Platform UI components for managing entities:
- User list and profiles
- Organization dashboards
- Team management views
- Collaborator invitation/management
- Bot configuration

## Integration with Core

Platform layer depends on:
- `core/foundation` - Base types, domain events, identity
- `core/observability` - Event tracking, causality, audit
- `core/governance` - Authorization, policy enforcement

Platform layer is consumed by:
- `features/domains/task` - References platform entities (userId, orgId, teamId)
- Application routing and authentication
- UI layout components

## Implementation Status

- ✅ Entity structure created (events, decisions, projections, commands, models)
- ✅ Event store scaffolding
- ✅ Process managers defined
- ⏳ Full implementation pending
- ⏳ UI components pending

## Next Steps

1. Implement event store services with Firebase/Supabase backends
2. Implement process manager logic
3. Create UI components for each entity
4. Integrate with existing authentication
5. Add comprehensive tests

## Alignment with Documentation

This structure aligns with:
- `docs/dev/0-目錄-v2-Task-SaaS.md` - SaaS multi-tenant architecture
- Task.md - Task as sole business entity
- SaaS.md - Platform layer multi-tenancy requirements
- Causality-Driven Event-Sourced Process System - Event sourcing patterns

---

**Version**: 1.0  
**Last Updated**: 2026-01-01  
**Status**: Structure established, implementation in progress
