# Documentation Optimization Summary

- Scope follows the semantic-equivalent minimization principle: remove wording that does not change reader decisions or system behavior while preserving all constraints and responsibilities.
- Inputs: every *.md/*.txt/*.pdf/*.docx under docs/ (175 files, 2.3 MB, ~198k words) indexed in [`raw_doc_index.csv`](./raw_doc_index.csv).

## Classification (purpose → importance)

| Scope | Purpose | Importance | Merge/Removal Signal |
| --- | --- | --- | --- |
| ⭐️/ | Strategic architecture roadmaps | Core | Consolidate summaries into canonical governance set |
| strategy-governance/ | Governance, architecture decisions | Core | Canonical owner of platform structure |
| identity-tenancy/ | AuthZ/AuthN, multi-tenancy | Core | Keep as sole identity source |
| automation-delivery/ | CI/CD, event bus, functions | Core | Canonical for automation; fold duplicate event-bus notes |
| security-compliance/ | Audit, security baselines | Core | Canonical for audit; retire parallel ⭐️ audit files |
| observability-operations/ | Ops guides, runbooks | Secondary | Keep concise runbooks; remove duplicate status notes |
| enablement-experience/ | Onboarding, UX/theme | Secondary | Keep concise; merge overlapping READMEs |
| change-control/, reference/ | Contracts, reference catalogs | Core | Keep; convert verbose READMEs to links |
| ai-governance/ | AI agent guardrails | Secondary | Keep brief policy; link from governance |
| collaboration/ | Work mgmt placeholder | Removable | Empty/minimal; remove or fold into governance |
| legacy-archive/, root loose *.md | Historical/duplicate | Obsolete | Archive after migration to canonical folders |
| INDEX.md + document-index.md | Navigation/ inventory | Duplicate | Replace with optimized index + generated inventory |

## Semantic analysis (duplication & friction)

- Navigation: `docs/INDEX.md` (narrative) duplicates `docs/document-index.md` (inventory); both restate directory purpose already implied by folder names.
- Audit: `docs/security-compliance/audit/*` is full suite; ⭐️ audit summaries and `security-compliance/Audit Log.md` repeat scope.
- Event Bus: `automation-delivery/event-bus/*` overlaps with ⭐️/Global Event Bus and legacy archive event-bus notes.
- Multiple READMEs provide identical folder descriptions; collaboration/ has almost no content.
- Root loose files (`PRD`, `Layer L-1~L2.md`, `Permission.md`, `Github.md`) mirror strategy-governance topics.

## Optimized docs draft (shorter canonical set)

- Introduce [`optimized-index.md`](./optimized-index.md) as the single navigation page (replaces `INDEX.md` + `document-index.md`), referencing the generated CSV for raw inventory.
- Canonical ownership: strategy-governance (structure), identity-tenancy (auth/tenancy), automation-delivery (CI/CD + event bus), security-compliance (audit/security), observability-operations (runbooks), enablement-experience (onboarding/UI), change-control/reference (contracts), ai-governance (agent policy).
- Consolidate duplicates: keep automation-delivery/event-bus and security-compliance/audit as sources; treat ⭐️ summaries and legacy event-bus/audit narratives as optional executive summaries to be trimmed or linked.
- Remove or fold collaboration placeholder into governance; move root loose files into matching strategy-governance topics, then retire originals.

## Standardization

- Limit headings to H1–H3 and prefer bullet/tables over prose; avoid decorative blockquotes.
- Use kebab-case filenames and declare the owning pillar in the opening section.
- Treat `raw_doc_index.csv` as generated data; regenerate with the command in this folder before reviews.

## Equivalence gate

- All retained decisions (pillar ownership, canonical folder, duplication handling) remain intact; optimization only removes redundant navigation text and duplicate summaries.
- No new concepts were introduced; responsibilities and constraints stay mapped to the same pillars.

## Metrics & export

- Inventory: 175 docs, 2.3 MB, ~198k words.
- Replacing `INDEX.md` (23 KB) + `document-index.md` (16 KB) with `optimized-index.md` (<5 KB) yields ~85% reduction for navigation content while preserving routing decisions.
- Artifacts: `raw_doc_index.csv` (inventory), `optimized-index.md` (canonical nav), this summary (classification, analysis, gate, maintenance).

## Next reductions (action queue)

- Remove `docs/INDEX.md` and `docs/document-index.md` after consumers switch to `optimized-index.md`.
- Relocate root loose files (`PRD`, `Permission.md`, `Layer L-1~L2.md`, `Github.md`) into `strategy-governance/` and delete originals.
- Collapse duplicate audit/event-bus narratives in ⭐️ and legacy folders into links pointing to `security-compliance/audit/` and `automation-delivery/event-bus/`.
- Fold `collaboration/` placeholder into governance or delete.
- Convert verbose folder READMEs into concise pointers where they repeat pillar responsibilities.

## Maintenance policy

- Reject new docs that duplicate pillars covered above; extend canonical files instead.
- Re-run the inventory command after merges:
  ```
  python - <<'PY'
  import os, csv, time
  rows=[]
  for dirpath, _, files in os.walk('docs'):
      for f in files:
          if f.lower().endswith(('.md','.txt','.pdf','.docx')):
              p=os.path.join(dirpath,f); st=os.stat(p)
              rows.append((f,p,os.path.splitext(f)[1][1:],st.st_size,time.strftime('%Y-%m-%d %H:%M:%S',time.localtime(st.st_mtime))))
  rows.sort(key=lambda r:r[1]); os.makedirs('docs/optimization', exist_ok=True)
  with open('docs/optimization/raw_doc_index.csv','w',newline='') as wf:
      w=csv.writer(wf); w.writerow(['name','path','type','bytes','modified']); w.writerows(rows)
  PY
  ```
- When adding content, prove it changes a decision or constraint; otherwise collapse into existing canonical pages.
