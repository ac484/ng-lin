---
description: "Guidance for creating more accessible code"
applyTo: "**"
---

# MCP Instructions for Copilot Agent

> ⚡ This file guides Copilot Agent to passively assist tasks using **MCP Context7**, **Sequential-Thinking**, and **Software-Planning-Tool**.

---

## 1️⃣ General Guidelines

- Copilot Agent should **read the task context** but **not insert code automatically** unless triggered by TODOs or prompts.
- Use **MCP Context7** metadata for each task: Task, Dependency, Priority, Stakeholder, Status, Notes.
- Follow **Sequential-Thinking**: reason step by step.
- Reference **Software-Planning-Tool** info for planning, status tracking, and task dependencies.

---

## 2️⃣ Task Format (MCP Context7)

Each task should have a structured context. Example in YAML/JSON format:

```yaml
- Task: "Implement Feature X"
  Dependency: ["LibA", "ModuleB"]
  Priority: "High"
  Stakeholder: "Alice"
  Status: "In Progress"
  Notes: "Requires integration with external API"
````

Or inline in code:

```ts
// MCPContext7: { Task: "Feature X", Dependency: ["LibA"], Priority: "High", Status: "In Progress" }
```

> Copilot Agent should parse these and suggest code changes **based on context**, not randomly.

---

## 3️⃣ Sequential-Thinking Steps

For each task, define step-by-step instructions:

```ts
// STEP 1: Validate dependencies
// STEP 2: Generate interfaces / type definitions
// STEP 3: Implement logic skeleton
// STEP 4: Write test cases
// STEP 5: Review integration with dependencies
```

> Copilot Agent should suggest snippets **per step**, ensuring logical order.

---

## 4️⃣ Software-Planning-Tool Integration

* Reference task status and ownership metadata from your planning tool (Jira, Notion, JSON, etc.).
* Include metadata in comments or external files:

```ts
// SoftwarePlanningTool: { Status: "In Progress", Owner: "Alice", Due: "2026-01-05" }
```

> Agent can use this to recommend next steps, reminders, or generate code stubs aligned with planning.

---

## 5️⃣ Passive Usage Rules

1. Only suggest **context-aware snippets** when prompted by:

   * `TODO` comments
   * Step markers (`STEP 1`, `STEP 2`…)
   * Code regions marked as MCP task
2. Do **not overwrite existing code** unless explicitly requested.
3. Use MCP Context7 + Sequential-Thinking to **reason before generating suggestions**.
4. Provide alternative suggestions or improvements if dependencies or priority change.

---

## 6️⃣ Example Usage in Code

```ts
// MCPContext7: { Task: "Feature Y", Dependency: ["LibC"], Priority: "Medium", Status: "Pending" }

// TODO [STEP 1]: Load context from `.github/copilot/tasks.yaml`
// TODO [STEP 2]: Generate type definitions for Feature Y
// TODO [STEP 3]: Implement core logic
// TODO [STEP 4]: Write tests and validate integration
```

> Copilot Agent reads MCP context from `.github/copilot/tasks.yaml` and sequential steps, then suggests code snippets **passively**.

---

## 7️⃣ Notes for Developers

* Keep this file updated with new tasks and metadata.
* Encourage **incremental, step-wise code generation**.
* Use descriptive metadata so Agent can reason effectively.
* Ensure `.github/copilot/tasks.yaml` exists to centralize all MCP tasks.

---

💡 **Pro Tip:**
Marking tasks clearly with `MCPContext7` + `STEP` + planning metadata is the key for **passive but smart code suggestions** from Copilot Agent.
