# Migration Guide: From src/ to Architecture Tree

## Overview

This guide helps developers migrate from the old monolithic `src/` structure to the new Event-Sourced architecture tree.

## What Changed?

### Before (Old Structure)
```
ng-lin/
└── src/                    # Everything mixed together
    └── app/
        ├── core/
        ├── features/
        ├── shared/
        └── layout/
```

### After (New Structure)
```
ng-lin/
├── core-system/            # Backend: Event-Sourced logic
│   └── src/
│       ├── aggregates/
│       ├── events/
│       ├── repositories/
│       ├── services/
│       ├── projections/
│       └── utils/
│
├── angular-app/            # Frontend: Angular SaaS
│   └── src/
│       └── app/
│           ├── core/
│           ├── features/
│           ├── shared/
│           └── layout/
│
└── src/                    # Legacy (backward compat)
```

## Migration Phases

### Phase 1: Understanding (✅ Complete)

**Status**: Documentation and structure created

**What was done:**
- Created `core-system/` and `angular-app/` directories
- Copied existing Angular code to `angular-app/src/`
- Created base Event-Sourced components
- Added comprehensive documentation

**What you need to know:**
- Original `src/` still works (backward compatible)
- New code should go in `core-system/` or `angular-app/`
- Read the architecture documents

**Action items:**
1. Read [ARCHITECTURE_TREE_GUIDE.md](./ARCHITECTURE_TREE_GUIDE.md)
2. Review [core-system/README.md](./core-system/README.md)
3. Review [angular-app/README.md](./angular-app/README.md)
4. Study [INTEGRATION_EXAMPLE.md](./INTEGRATION_EXAMPLE.md)

### Phase 2: New Development (Current Phase)

**Status**: Ready for new features

**Guidelines:**
- All new backend logic goes in `core-system/`
- All new Angular components go in `angular-app/`
- Follow Event Sourcing patterns
- Use provided base classes and utilities

**How to start:**
1. Follow [HOW_TO_ADD_FEATURE.md](./HOW_TO_ADD_FEATURE.md)
2. Use `core-system/src/` for domain events and aggregates
3. Use `angular-app/src/app/features/` for new UI features
4. Reference existing code in `src/` as needed

**Example: Adding Invoice Feature**
```bash
# 1. Define events
touch core-system/src/events/InvoiceEvents.ts

# 2. Create aggregate
touch core-system/src/aggregates/InvoiceAggregate.ts

# 3. Create projection
touch core-system/src/projections/InvoiceProjection.ts

# 4. Create Angular components
mkdir -p angular-app/src/app/features/invoices
touch angular-app/src/app/features/invoices/invoice-list.component.ts
```

### Phase 3: Gradual Migration (Future)

**Status**: Not started

**Plan:**
- Identify features in `src/` that can be migrated
- Migrate one feature at a time
- Test thoroughly after each migration
- Update imports and references

**Priority features to migrate:**
1. Task management (already has events in core-system)
2. FieldLog (already has events in core-system)
3. Invoice (already has events in core-system)
4. Authentication (keep in angular-app/src/app/core/)
5. Shared components (keep in angular-app/src/app/shared/)

**Migration checklist per feature:**
- [ ] Extract business logic to core-system
- [ ] Define domain events
- [ ] Create aggregate
- [ ] Implement projection
- [ ] Update Angular components to use new API
- [ ] Write tests
- [ ] Remove old code from src/
- [ ] Update documentation

### Phase 4: Build Configuration (Future)

**Status**: Not started

**Plan:**
- Update `angular.json` to support multiple source roots
- Update `tsconfig.json` with path mappings
- Configure build scripts for core-system
- Set up testing infrastructure

**Example tsconfig.json paths:**
```json
{
  "compilerOptions": {
    "paths": {
      "@core/*": ["core-system/src/*"],
      "@app/*": ["angular-app/src/app/*"],
      "@legacy/*": ["src/app/*"]
    }
  }
}
```

### Phase 5: Cleanup (Future)

**Status**: Not started

**Plan:**
- Remove legacy `src/` directory
- Update all imports
- Remove backward compatibility code
- Final documentation update

## Import Patterns

### Old Way (Legacy)
```typescript
// src/app/some-feature/component.ts
import { SomeService } from '../core/services/some.service';
```

### New Way (Recommended)
```typescript
// angular-app/src/app/features/tasks/component.ts
import { TaskService } from './task.service';

// core-system/src/services/TaskService.ts
import { TaskAggregate } from '../aggregates/TaskAggregate';
import { DomainEvent } from '../events/BaseEvents';
```

### Transition Pattern
```typescript
// During migration, you might need both:
import { LegacyService } from '../../../../src/app/core/services/legacy.service';
import { TaskService } from '../../../../../core-system/src/services/TaskService';
```

## Common Questions

### Q: Can I still use code in src/?
**A**: Yes! The `src/` directory is preserved for backward compatibility. However, new features should go in the new structure.

### Q: Do I need to migrate everything at once?
**A**: No. Migration can be gradual. Focus on new features first, then migrate existing ones as needed.

### Q: How do I share code between core-system and angular-app?
**A**: 
1. Put shared types/interfaces in `core-system/src/events/` or `core-system/src/utils/`
2. Import from `core-system/src/` in Angular app
3. Use TypeScript path mappings for cleaner imports (future)

### Q: What about Firebase Cloud Functions?
**A**: Cloud Functions can directly import from `core-system/src/` since they're TypeScript. Example:
```typescript
import { TaskService, eventStore } from '../../core-system/src';
```

### Q: How do I test the new structure?
**A**: 
1. Unit tests go in `core-system/tests/`
2. Integration tests can test event flow
3. E2E tests test the full Angular app

### Q: What if I need to change an event definition?
**A**: Event evolution:
1. Never modify existing events (they're immutable)
2. Create new event version or new event type
3. Handle both old and new versions in projections
4. Document the change

## Quick Reference

### Core System
- **Events**: `core-system/src/events/`
- **Aggregates**: `core-system/src/aggregates/`
- **Projections**: `core-system/src/projections/`
- **Services**: `core-system/src/services/`
- **Tests**: `core-system/tests/`

### Angular App
- **Components**: `angular-app/src/app/features/`
- **Services**: `angular-app/src/app/features/*/services/`
- **Shared**: `angular-app/src/app/shared/`
- **Core**: `angular-app/src/app/core/`

### Documentation
- **Architecture**: [ARCHITECTURE_TREE_GUIDE.md](./ARCHITECTURE_TREE_GUIDE.md)
- **Integration**: [INTEGRATION_EXAMPLE.md](./INTEGRATION_EXAMPLE.md)
- **How-to**: [HOW_TO_ADD_FEATURE.md](./HOW_TO_ADD_FEATURE.md)
- **ADR**: [docs/08-governance/ADR-001-architecture-tree-structure.md](./docs/08-governance/ADR-001-architecture-tree-structure.md)

## Getting Help

### Resources
1. **Architecture Docs**: Start with `docs/00-index/00-index.md`
2. **Examples**: Review `INTEGRATION_EXAMPLE.md`
3. **How-to Guide**: Follow `HOW_TO_ADD_FEATURE.md`
4. **Core Principles**: Read `docs/02-paradigm/core-principles.md`

### Support Channels
- GitHub Issues: For bugs and feature requests
- Documentation: All questions answered in docs/
- Code Reviews: Follow the checklist in PRs

## Success Criteria

You'll know the migration is successful when:
- [ ] Team understands Event Sourcing concepts
- [ ] New features follow the architecture tree
- [ ] Events are properly defined and versioned
- [ ] Projections are optimized for queries
- [ ] Tests cover event replay and causality
- [ ] Documentation is up to date
- [ ] Build and deploy processes work smoothly

## Timeline (Estimated)

- **Phase 1**: ✅ Complete (1 day)
- **Phase 2**: 🔄 Current (ongoing)
- **Phase 3**: ⏳ 2-3 sprints
- **Phase 4**: ⏳ 1 sprint
- **Phase 5**: ⏳ 1 sprint

Total estimated time: 3-4 months for complete migration

## Conclusion

The new architecture tree structure provides:
- ✅ Clear separation of concerns
- ✅ Better scalability
- ✅ Improved testability
- ✅ Event Sourcing benefits
- ✅ Reduced development burden

Start small, follow the guides, and migrate gradually!
