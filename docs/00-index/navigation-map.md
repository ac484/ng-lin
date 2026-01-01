# Documentation Navigation Map

> Quick guide to Causality-Driven Event-Sourced Process System documentation

## 🎯 By Role

### Developers - Getting Started
1. [01-vision](../01-vision) → Understand WHY
2. [02-paradigm](../02-paradigm) → Core principles
3. [04-core-model](../04-core-model) → Events, Decisions, Projections
4. [09-anti-patterns](../09-anti-patterns) → Avoid mistakes

### Developers - Implementation
1. [03-architecture](../03-architecture) → System structure
2. [Task.md](../Task.md) → Task domain (only business entity)
3. [SaaS.md](../SaaS.md) → Platform layer (multi-tenant)
4. [06-projection-decision](../06-projection-decision) → Views and rules

### Architects
1. [01-vision](../01-vision) → System goals
2. [03-architecture](../03-architecture) → Layered model
3. [04-core-model](../04-core-model) → Core concepts
4. [08-governance](../08-governance) → Event versioning
5. [09-anti-patterns](../09-anti-patterns) → Design pitfalls

### Business Stakeholders
1. [01-vision/02-system-goals.md](../01-vision/02-system-goals.md) → Business value
2. [Task.md](../Task.md) → Core business entity
3. [06-projection-decision](../06-projection-decision) → Multi-view capabilities

## 📚 By Topic

**Event Sourcing**
→ [02-paradigm](../02-paradigm), [04-core-model/01-event-model.md](../04-core-model/01-event-model.md)

**Causality Tracking**
→ [04-core-model/02-causality-model.md](../04-core-model/02-causality-model.md)

**Projections**
→ [06-projection-decision](../06-projection-decision), [Task.md](../Task.md)

**Platform**
→ [SaaS.md](../SaaS.md), [03-architecture](../03-architecture)

**Anti-Patterns**
→ [09-anti-patterns](../09-anti-patterns), [Disable.md](../Causality-Driven%20Event-Sourced%20Process%20System/Disable.md)

## 🔍 Common Questions

**"Why Event Sourcing?"** → [02-paradigm/02-why-not-crud.md](../02-paradigm/02-why-not-crud.md)
**"What events to create?"** → [Enable.md](../Causality-Driven%20Event-Sourced%20Process%20System/Enable.md)
**"What to avoid?"** → [Disable.md](../Causality-Driven%20Event-Sourced%20Process%20System/Disable.md)
**"How to build views?"** → [06-projection-decision](../06-projection-decision)
**"How to track causality?"** → [04-core-model/02-causality-model.md](../04-core-model/02-causality-model.md)
**"How to debug?"** → [07-operability](../07-operability)
**"How to version events?"** → [08-governance](../08-governance)

## 📋 All Sections

| # | Section | Focus |
|---|---------|-------|
| 00 | index | Navigation |
| 01 | vision | Why & Goals |
| 02 | paradigm | Core Principles |
| 03 | architecture | System Structure |
| 04 | core-model | Events/Decisions |
| 05 | process-layer | Workflows |
| 06 | projection-decision | Views & Rules |
| 07 | operability | Operations |
| 08 | governance | Event Evolution |
| 09 | anti-patterns | What NOT to do |
| 10 | reference | External Links |
| 99 | appendix | Glossary/Catalogs |

## 🚀 Key Links

- [Task Domain](../Task.md) - Only business entity (~100 files)
- [Platform Layer](../SaaS.md) - Multi-tenant SaaS (~170 files)
- [File Structure](../0-目錄-v2-Task-SaaS.md) - Complete ~340 files
- [Enable/Disable/SYS](../Causality-Driven%20Event-Sourced%20Process%20System/) - Core principles

---

**Last Updated**: 2025-12-31

