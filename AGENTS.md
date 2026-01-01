# GigHub Project - Agent Guidelines

**Project**: GigHub - Enterprise Construction Site Progress Tracking System  
**Version**: 20.1.0  
**Last Updated**: 2026-01-01

## Project Overview

GigHub is an enterprise-grade construction site progress tracking management system built with modern web technologies. The system provides a comprehensive solution for managing construction projects with real-time collaboration, secure data handling, and scalable architecture.

### Core Technologies

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend Framework** | Angular | 20.3.0 |
| **UI Framework** | ng-alain + ng-zorro-antd | 20.1.0 + 20.3.1 |
| **State Management** | Angular Signals | Native |
| **Backend Services** | Firebase/Firestore | 20.0.1 |
| **Cloud Functions** | Firebase Functions v2 | 7.0.0 |
| **Language** | TypeScript | 5.9.2 |
| **Target** | ES2022 | - |
| **Package Manager** | Yarn | 4.9.2 |
| **Node.js** | LTS | 22.x |

### System Architecture

**Three-Layer Architecture**:
```
UI Layer (Angular Components)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Firebase/Firestore (Backend)
```

**Key Design Patterns**:
- **Repository Pattern**: All data access through repository layer
- **Event-Driven Architecture**: Module communication via BlueprintEventBus
- **Standalone Components**: Modern Angular architecture
- **Signal-Based State**: Reactive state management with Angular Signals
- **Multi-Tenant**: Organization → Team → Partner hierarchy

## Quick Start Commands

### Development

```bash
# Install dependencies
yarn install

# Start development server (opens browser)
yarn start
# or
ng serve

# Development with HMR (Hot Module Replacement)
yarn hmr
```

### Building

```bash
# Production build
yarn build

# Build with source maps for analysis
yarn analyze

# View bundle analysis
yarn analyze:view
```

### Testing

```bash
# Run unit tests (watch mode)
yarn test

# Run tests with coverage
yarn test-coverage

# Run integration tests
yarn test:integration

# Run integration tests with Firebase emulator
yarn test:emulator

# Run all checks (lint + test)
yarn check

# Full check including build
yarn check:full

# Quick check (lint only, with auto-fix)
yarn check:quick
```

### Linting & Formatting

```bash
# Run all linters
yarn lint

# Lint TypeScript files
yarn lint:ts

# Lint LESS styles
yarn lint:style
```

### Firebase Emulators

```bash
# Start Firebase emulators (Firestore + Storage)
yarn emulator:start
```

### End-to-End Testing

```bash
# Run E2E tests
yarn e2e
```

## Code Style & Conventions

### Angular 20 Best Practices

**Component Architecture**:
- Use **standalone components** by default
- Leverage **Angular Signals** for reactive state management
- Use `input()`, `output()`, `viewChild()`, `viewChildren()`, `contentChild()`, `contentChildren()` functions (Angular >= 19)
- Implement **dependency injection** using `inject()` function
- Apply **OnPush change detection** strategy for performance

**New Control Flow Syntax**:
```typescript
// Use @if, @for, @switch instead of *ngIf, *ngFor, *ngSwitch
@if (condition) {
  <div>Content</div>
}

@for (item of items; track item.id) {
  <div>{{ item.name }}</div>
}

@switch (value) {
  @case ('option1') { <div>Option 1</div> }
  @case ('option2') { <div>Option 2</div> }
  @default { <div>Default</div> }
}
```

**State Management**:
```typescript
// Use signals for reactive state
import { signal, computed, effect } from '@angular/core';

// Writable signal for mutable state
const count = signal(0);

// Computed signal for derived state
const doubleCount = computed(() => count() * 2);

// Effect for side effects
effect(() => {
  console.log('Count changed:', count());
});
```

### TypeScript Standards

- **Enable strict mode** in tsconfig.json
- Define clear **interfaces and types**
- Use **type guards** for runtime type safety
- Implement proper **error handling** with RxJS operators
- Use **typed forms** (FormGroup, FormControl)

### File Naming Conventions

Follow Angular Style Guide (https://angular.dev/style-guide):

- **Components**: `feature.component.ts`
- **Services**: `feature.service.ts`
- **Repositories**: `feature.repository.ts`
- **Stores**: `feature.store.ts`
- **Models**: `feature.model.ts`
- **Guards**: `feature.guard.ts`
- **Pipes**: `feature.pipe.ts`

Use **kebab-case** for file names: `user-profile.component.ts`

### Project Structure

```
src/
├── app/
│   ├── core/              # Core modules (services, guards, interceptors)
│   ├── features/          # Reusable business features (cross-route capabilities)
│   ├── routes/            # Page route components
│   ├── shared/            # Shared components, directives, pipes
│   ├── layout/            # Layout components
│   └── app.config.ts      # App configuration
├── assets/                # Static resources
├── environments/          # Environment configurations
└── firebase/              # Firebase Cloud Functions (multiple codebases)
```

### Code Quality Standards

**Component Design**:
- Keep components **focused and single-purpose**
- Separate **smart (container) and presentational (dumb) components**
- Keep templates **clean** and logic in component classes
- Use **Angular directives and pipes** for reusable functionality

**Styling**:
- Use **component-level CSS encapsulation** (ViewEncapsulation.Emulated)
- Prefer **SCSS** for styling with consistent theming
- Implement **responsive design** (CSS Grid, Flexbox, Angular CDK)
- Follow **ng-zorro-antd** component usage patterns
- Maintain **accessibility** (ARIA attributes, semantic HTML)

**Security**:
- **Sanitize user inputs** using Angular's built-in sanitization
- Implement **route guards** for authentication/authorization
- Use **HttpInterceptor** for CSRF protection and auth headers
- Validate form inputs with **reactive forms and validators**
- Never perform **direct DOM manipulation**

**Performance**:
- Enable **production builds** (`ng build --configuration production`)
- Use **lazy loading** for routes
- Optimize change detection with **OnPush** strategy
- Use **trackBy** in `@for` loops
- Implement **SSR/SSG** with Angular Universal if needed

## Deployment & CI/CD

### Build Process

```bash
# Production build
npm run build

# Output directory
dist/
```

### Firebase Deployment

The project uses Firebase for hosting and backend services.

**Deploy Everything**:
```bash
firebase deploy
```

**Deploy Specific Services**:
```bash
# Frontend hosting
firebase deploy --only hosting

# Backend functions
firebase deploy --only functions

# Firestore rules
firebase deploy --only firestore:rules

# Storage rules
firebase deploy --only storage
```

### CI/CD Pipeline

The project includes pre-commit hooks via Husky:

```json
"husky": {
  "hooks": {
    "pre-commit": "lint-staged",
    "pre-push": "npm run check:full"
  }
}
```

**Pre-commit checks**:
- ESLint for TypeScript/HTML files
- Stylelint for LESS files

**Pre-push checks**:
- Full lint
- All unit tests
- Production build

### Environment Configuration

Environment-specific settings are managed through:
- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

Firebase configuration:
- `firebase.json` - Firebase project configuration
- `firestore.rules` - Firestore security rules
- `firestore.indexes.json` - Firestore indexes
- `storage.rules` - Storage security rules

## General Instructions for All Agents

### Development Workflow

1. **Always run linters** before committing code
2. **Write tests** for new features and bug fixes
3. **Update documentation** when changing APIs or architecture
4. **Use Angular CLI** for scaffolding new components/services
5. **Follow the repository pattern** for all data access
6. **Use BlueprintEventBus** for cross-module communication
7. **Maintain backward compatibility** in public contracts

### Repository Pattern Usage

All Firebase/Firestore interactions must go through repository layer:

```typescript
// ✅ GOOD: Using repository
@Injectable({ providedIn: 'root' })
export class TaskService {
  private taskRepo = inject(TaskRepository);
  
  async getTasks(): Promise<Task[]> {
    return this.taskRepo.findAll();
  }
}

// ❌ BAD: Direct Firestore access
@Injectable({ providedIn: 'root' })
export class TaskService {
  private firestore = inject(Firestore);
  
  async getTasks() {
    return getDocs(collection(this.firestore, 'tasks'));
  }
}
```

### Event-Driven Communication

Use BlueprintEventBus for module decoupling:

```typescript
// Publishing events
this.eventBus.publish(new TaskCreatedEvent(task));

// Subscribing to events
this.eventBus.subscribe(TaskCreatedEvent, (event) => {
  console.log('Task created:', event.task);
});
```

### Testing Requirements

- **Minimum 85% code coverage** for domain and application layers
- Use `TestBed` for component testing
- Mock dependencies with `jasmine.createSpyObj`
- Test signal-based state updates
- Use Firebase emulator for integration tests

### Documentation Standards

- Add **JSDoc comments** to public APIs
- Document **complex business logic** with inline comments
- Update **README.md** for major feature additions
- Create **ADRs** (Architecture Decision Records) for significant decisions
- Maintain **CHANGELOG.md** for version tracking

### Security Requirements

- **Never commit secrets** to source control
- Use **environment variables** for configuration
- Implement **input validation** at service boundaries
- Apply **principle of least privilege** for permissions
- Follow **OWASP security guidelines**
- Use **Firestore Security Rules** for data protection

### Performance Guidelines

- **Lazy load** feature modules when possible
- Use **Angular's async pipe** for observable subscriptions
- Implement **pagination** for large data sets
- **Cache frequently accessed** data appropriately
- Use **debounce/throttle** for user input handling
- **Avoid unnecessary change detection** triggers

### Common Pitfalls to Avoid

❌ **Don't**:
- Use `any` type (prefer `unknown` or specific types)
- Directly manipulate DOM (use Angular's renderer)
- Create memory leaks (unsubscribe from observables)
- Mix concerns (keep services single-purpose)
- Hardcode configuration values
- Skip error handling
- Ignore accessibility (a11y)

✅ **Do**:
- Use TypeScript's strict mode
- Follow Angular style guide
- Write meaningful test descriptions
- Keep components focused and small
- Use reactive programming patterns
- Handle all error cases
- Think about edge cases

## Integration with Custom Agents

This document provides general guidelines for all agents. For specialized tasks, refer to:

- **Backend Development**: See `.github/agents/backend.agent.md` for Firebase Functions specific guidance
- **Architecture Design**: Use `@arch` agent for architectural diagrams and NFR analysis
- **Latest Documentation**: Use `@Context7` agent for up-to-date library documentation
- **Code Modernization**: Use `@modernization` agent for legacy code updates
- **Testing**: Use `@playwright-tester` agent for E2E test development

## Additional Resources

- **Project Documentation**: `/docs/` directory
- **Copilot Instructions**: `.github/copilot-instructions.md`
- **Framework Instructions**: `.github/instructions/` directory
- **Custom Agents**: `.github/agents/` directory
- **Angular Style Guide**: https://angular.dev/style-guide
- **Firebase Documentation**: https://firebase.google.com/docs
- **ng-alain Documentation**: https://ng-alain.com

## Support & Contributions

For questions or contributions:
- Review `docs/README.md` for documentation navigation
- Check `Task.md` for requirement submission templates
- Follow `原則.md` for GigHub system design principles
- Open issues on GitHub for bugs or feature requests

---

**Remember**: This document provides project-wide guidelines. Always refer to specialized agent profiles for domain-specific best practices and detailed implementation guidance.
