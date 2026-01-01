#!/usr/bin/env node

/**
 * GitHub Copilot Memory 儲存腳本範例
 * 
 * 此腳本示範如何從文件中提取資訊並儲存到 Copilot Memory
 * 實際上這些記憶已經被儲存，此腳本僅供參考和學習
 */

// 注意：這些函數在 GitHub Copilot 環境中可用
// 在一般 Node.js 環境中執行會失敗

const projectMemories = [
  {
    category: "general",
    citations: "docs/01-vision/01-problem-statement.md, docs/00-index/00-index.md, README.md",
    fact: "ng-lin (GigHub) is a construction site progress tracking system implementing a Causality-Driven Event-Sourced Process System with Angular 20, Firebase/Firestore, and ng-alain framework",
    reason: "This is the fundamental definition of the project that should inform all development decisions. Understanding the core system paradigm (event-sourced with causality tracking) is essential for maintaining architectural consistency when adding features or fixing issues.",
    subject: "ng-lin project definition"
  },
  {
    category: "general",
    citations: "docs/01-vision/02-system-goals.md",
    fact: "Primary goals: (1) Complete immutable event recording with causality metadata, (2) Explicit cause-effect relationship tracking across system boundaries, (3) Deterministic state replay from any point in time, (4) Decision simulation and what-if analysis capabilities",
    reason: "These goals define success criteria and guide architectural decisions. When evaluating implementation approaches or reviewing code, these goals help determine if the solution aligns with the system's fundamental objectives. Critical for maintaining consistency in a event-sourced system.",
    subject: "core system goals"
  },
  {
    category: "general",
    citations: "docs/dev/0.md lines 1-150",
    fact: "Tasks follow a 3-level hierarchy: Contract Item → Parent Task → Child Tasks → Grandchild Tasks. Each level can be split using TaskSplit events with conservation rules (amount conservation, quantity conservation). Parent tasks become containers after splitting and cannot execute directly.",
    reason: "Understanding the task hierarchy model is essential for implementing task management features correctly. The splitting rules (conservation laws, state restrictions) prevent data inconsistency and ensure proper event sourcing patterns are maintained throughout the system.",
    subject: "task hierarchical structure"
  },
  {
    category: "general",
    citations: "docs/01-vision/01-problem-statement.md",
    fact: "Core problem being solved: Traditional CRUD systems lose change history, causality relationships, and decision-making ability. Event sourcing alone lacks explicit causality modeling and simulation capabilities. System provides immutability, auditability, time-travel queries, and deterministic replay.",
    reason: "Understanding the problem space prevents reverting to anti-patterns (e.g., direct state mutation, losing causality information). This knowledge is crucial when reviewing PRs or implementing features to ensure solutions don't reintroduce the problems the system was designed to solve.",
    subject: "problem statement and motivation"
  },
  {
    category: "general",
    citations: "docs/00-index/00-index.md lines 90-110",
    fact: "Four core architectural principles: (1) Event = Fact (events describe what happened, not commands), (2) State = Derived (all state replay from events), (3) Causality = Explicit (every event records its cause), (4) Replay = Deterministic (same events produce same state)",
    reason: "These are non-negotiable architectural constraints that define the system paradigm. Violating any of these principles breaks the core guarantees (auditability, replayability, causality tracking). Essential for code reviews and architectural decision making to prevent anti-patterns.",
    subject: "core architectural principles"
  },
  {
    category: "general",
    citations: "docs/00-index/00-index.md lines 109-120",
    fact: "Three-layer architecture: L0 (Fact) - immutable event definitions only, L1 (Process) - event connection and flow orchestration with sagas/process managers, L2 (Projection) - derived read models and query optimization. Dependency flow: UI → Features → Core → Infrastructure, with Infrastructure implementing Core interfaces.",
    reason: "The layering model ensures separation of concerns and prevents architectural violations. L0 never depends on L1/L2, process orchestration stays in L1, and projections in L2 are disposable. This layering must be maintained to preserve system integrity and enable independent evolution of each layer.",
    subject: "layered architecture model"
  },
  {
    category: "general",
    citations: "docs/00-index/00-index.md lines 121-128, README.md lines 20-30",
    fact: "Key technologies: Angular 20 with standalone components, TypeScript 5.9, Firebase 20.0.1 (Firestore for data, Cloud Functions), ng-alain enterprise UI framework, ng-zorro-antd components. Multi-tenant architecture supporting organizations/teams/partners with complex permissions via Firestore Security Rules.",
    reason: "Knowing the exact technology stack and versions is essential for making compatible implementation decisions, searching for solutions, and understanding framework-specific patterns (e.g., Angular 20 standalone components vs old NgModule approach). Multi-tenant architecture affects all data access patterns.",
    subject: "technology stack and versions"
  },
  {
    category: "general",
    citations: "docs/01-vision/02-system-goals.md lines 50-70",
    fact: "Quality targets: 99.9% availability, event write <100ms (P95), query response <50ms (P95), replay speed >10000 events/sec. Development standards: 100% replayable tests, complete event tracing for debugging, modular architecture. Operations: full observability, point-in-time recovery, root cause analysis, backwards-compatible evolution.",
    reason: "These performance and quality targets set clear expectations for implementation. When optimizing code or reviewing performance issues, these metrics provide objective criteria. The testing and observability requirements ensure the system maintains its event-sourced guarantees in production.",
    subject: "quality and performance targets"
  }
];

console.log('='.repeat(80));
console.log('GitHub Copilot Memory 儲存腳本範例');
console.log('='.repeat(80));
console.log('\n此腳本展示如何儲存專案的核心資訊到 Copilot Memory\n');
console.log(`共有 ${projectMemories.length} 個記憶需要儲存：\n`);

projectMemories.forEach((memory, index) => {
  console.log(`${index + 1}. 主題: ${memory.subject}`);
  console.log(`   類別: ${memory.category}`);
  console.log(`   來源: ${memory.citations.split(',')[0]}...`);
  console.log(`   事實: ${memory.fact.substring(0, 80)}...`);
  console.log('');
});

console.log('\n' + '='.repeat(80));
console.log('這些記憶已經在 Copilot 環境中被儲存');
console.log('='.repeat(80));
console.log('\n如何使用這些記憶：');
console.log('');
console.log('1. 搜尋記憶：');
console.log('   memory-search_nodes({ query: "ng-lin" })');
console.log('');
console.log('2. 查看特定記憶：');
console.log('   memory-open_nodes({ names: ["ng-lin project definition"] })');
console.log('');
console.log('3. 讀取所有記憶：');
console.log('   memory-read_graph()');
console.log('');
console.log('詳細使用方式請參閱：docs/COPILOT_MEMORY_GUIDE.md');
console.log('='.repeat(80));

// 提示：在 GitHub Copilot 環境中，你可以使用以下方式儲存記憶
// store_memory({
//   category: "general",
//   citations: "...",
//   fact: "...",
//   reason: "...",
//   subject: "..."
// })
