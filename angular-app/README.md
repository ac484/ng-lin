# Angular App - SaaS Frontend

## Overview

This is the Angular-based SaaS frontend for the GigHub construction site progress tracking system. It consumes the Event-Sourced core system and provides a user-friendly interface for managing projects, tasks, invoices, and field logs.

## Structure

```
angular-app/
├── src/
│   ├── app/
│   │   ├── app.module.ts            # Angular App Module
│   │   ├── app.component.ts         # App entry component
│   │   ├── features/                # Feature modules (Tasks / FieldLog / Invoice)
│   │   │   ├── tasks/
│   │   │   │   ├── task-list.component.ts
│   │   │   │   └── task-detail.component.ts
│   │   │   ├── fieldlogs/
│   │   │   │   ├── fieldlog-list.component.ts
│   │   │   │   └── fieldlog-detail.component.ts
│   │   │   └── invoices/
│   │   │       ├── invoice-list.component.ts
│   │   │       └── invoice-detail.component.ts
│   │   ├── shared/                   # Shared components / services
│   │   │   ├── api.service.ts        # Call core system API
│   │   │   └── auth.service.ts       # Login / authentication
│   │   └── core/                     # Frontend state management
│   └── main.ts                        # Angular App startup entry
│
├── angular.json
└── package.json
```

## Technology Stack

- **Angular 20**: Latest Angular with standalone components
- **TypeScript 5.9**: Strict mode enabled
- **ng-alain**: Enterprise UI framework
- **ng-zorro-antd**: Ant Design components
- **Firebase**: Authentication and data sync
- **RxJS**: Reactive programming

## Integration with Core System

The Angular app integrates with the core system through:

1. **Firebase Firestore**: Real-time data sync with projections
2. **Cloud Functions**: API calls to core system services
3. **Event Bus**: Subscribe to domain events
4. **State Management**: Local state derived from events

## Features

### Task Management
- Create, update, and track tasks
- Hierarchical task trees (parent-child relationships)
- Task status transitions (Todo → In Progress → Done)
- Task assignments and due dates

### Field Log
- Daily construction site logs
- Weather and site conditions tracking
- Photo and document attachments
- Task and invoice status recording

### Invoice Management
- Request, approve, and track invoices
- Multiple invoicing support
- Payment tracking
- Invoice history

## Development Guidelines

1. Use Angular 20 standalone components
2. Use signals for reactive state management
3. Follow ng-alain and ng-zorro conventions
4. Keep components focused and testable
5. Use TypeScript strict mode
6. Follow reactive programming patterns with RxJS

## Running the App

See main README.md for installation and running instructions.
