src/app/
│
├── core/
│   ├── foundation/
│   ├── governance/
│   ├── observability/
│   ├── error/
│   ├── result/
│   ├── time/
│   ├── validation/
│   ├── serialization/
│   ├── lifecycle/
│   └── examples/
│
├── infrastructure/
│   ├── abstractions/
│   │   ├── auth/
│   │   ├── repository/
│   │   ├── event-store/
│   │   ├── storage/
│   │   └── functions/
│   │
│   ├── firebase/
│   │   ├── auth/
│   │   ├── repository/
│   │   ├── event-store/
│   │   │   ├── replay/
│   │   │   └── validation/
│   │   ├── storage/
│   │   └── functions/
│   │
│   ├── supabase/
│   │   ├── auth/
│   │   ├── repository/
│   │   ├── event-store/
│   │   ├── storage/
│   │   └── realtime/
│   │
│   └── providers/
│
├── platform/
│   ├── entities/
│   │   ├── organization/
│   │   │   ├── entities/
│   │   │   ├── value-objects/
│   │   │   ├── policies/
│   │   │   └── events/
│   │   │
│   │   ├── workspace/
│   │   │   ├── entities/
│   │   │   ├── value-objects/
│   │   │   ├── policies/
│   │   │   └── events/
│   │   │
│   │   ├── user/
│   │   │   ├── entities/
│   │   │   ├── value-objects/
│   │   │   ├── policies/
│   │   │   └── events/
│   │   │
│   │   ├── team/
│   │   ├── collaborator/
│   │   └── bot/
│   │
│   ├── context/
│   │   └── platform-context/
│   │
│   ├── contracts/
│   │   └── platform-boundary/
│   │
│   ├── events/
│   │   ├── organization/
│   │   ├── workspace/
│   │   └── user/
│   │
│   ├── event-store/
│   ├── processes/
│   └── ui/
│       └── components/
│
├── features/
│   ├── domains/
│   │   ├── issue/
│   │   │   ├── domain/
│   │   │   ├── events/
│   │   │   ├── decisions/
│   │   │   ├── commands/
│   │   │   ├── projections/
│   │   │   ├── models/
│   │   │   ├── processes/
│   │   │   ├── infrastructure/
│   │   │   ├── acl/
│   │   │   └── ui/
│   │   │       └── components/
│   │   │
│   │   ├── discussion/
│   │   ├── comment/
│   │   ├── user/
│   │   ├── attachment/
│   │   └── activity/
│   │
│   ├── processes/
│   │   ├── issue-lifecycle/
│   │   ├── moderation/
│   │   └── notification-dispatch/
│   │
│   ├── capabilities/
│   │   ├── notification/
│   │   ├── search/
│   │   ├── analytics/
│   │   ├── settings/
│   │   └── admin/
│   │
│   ├── shared-domain/
│   ├── contracts/
│   └── ui-composition/
│
├── shared-ui/
│   ├── components/
│   ├── directives/
│   ├── pipes/
│   ├── utils/
│   └── constants/
│
├── layouts/
│
└── dev-tools/
    └── core-tester/
