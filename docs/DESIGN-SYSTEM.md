# Design System — Per Aspera Mod Creator

**This project follows the [Google design.md](https://github.com/google-labs-code/design.md) format for documenting architectural decisions.**

---

## 📁 Design Documentation Structure

```
per-aspera-mod-creator/
├── DESIGN.md                    # Main architecture document
├── docs/
│   ├── DESIGN-SYSTEM.md         # This file (format guide)
│   ├── design/
│   │   ├── phase-10-official-data.md
│   │   ├── phase-11-composition.md
│   │   ├── phase-12-validation.md
│   │   ├── phase-13-publishing.md    (planned)
│   │   ├── phase-14-collaboration.md (planned)
│   │   └── phase-15-analytics.md     (planned)
│   └── decisions/
│       ├── 001-service-architecture.md
│       ├── 002-mod-protection.md
│       ├── 003-database-schema.md
│       └── ...more decisions...
├── DATAMODEL-INTEGRATION-PLAN.md
├── API-ENDPOINTS.md
└── README.md
```

---

## 🎯 Google design.md Format

The Google design.md format emphasizes:

1. **Clear Problem Statement**
   - What problem are we solving?
   - Why does it matter?

2. **Solution Description**
   - How do we solve it?
   - What's the implementation?

3. **Trade-offs**
   - What do we gain?
   - What do we lose?
   - Why is this the best choice?

4. **Alternatives**
   - Other options considered
   - Why they were rejected

---

## 📋 Template for Design Decisions

Create a file in `docs/design/` for each major decision:

**Filename format:** `phase-N-topic.md` or `decision-NNN-topic.md`

**Template:**

```markdown
# [Phase N] [Decision Title]

**Author:** [Your name]  
**Date:** [Date created]  
**Status:** [Approved/In Review/Proposed]  
**Last Updated:** [Date]  

---

## Overview

[1-2 sentence summary of what this decision is about]

---

## Problem

[Clear description of the problem being solved]

**Why it matters:**
- Reason 1
- Reason 2
- Reason 3

---

## Solution

[Detailed explanation of the chosen solution]

### How it works

[Technical explanation, diagrams, code examples]

### Implementation Details

- Detail 1
- Detail 2
- Detail 3

---

## Trade-offs

### What We Gain
- Benefit 1
- Benefit 2

### What We Lose
- Cost 1
- Cost 2

### Why This is the Best Choice

[Explanation of how benefits outweigh costs]

---

## Alternatives Considered

### Alternative 1: [Name]
**How it works:** [Brief description]  
**Why rejected:** [Specific reasons]

### Alternative 2: [Name]
**How it works:** [Brief description]  
**Why rejected:** [Specific reasons]

---

## Impact

### On Development
- Impact 1
- Impact 2

### On Performance
- Impact 1
- Impact 2

### On Maintenance
- Impact 1
- Impact 2

---

## Future Considerations

[What we might revisit or improve]

---

## References

- [Link 1]
- [Link 2]

---

## Checklist

- [ ] Decision approved by team
- [ ] Implementation complete
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Performance validated
```

---

## 🔄 How to Create Design Decisions

### Step 1: Create the File
```bash
# For phase-based decisions
docs/design/phase-10-official-data.md

# For general decisions
docs/design/decision-001-service-architecture.md
```

### Step 2: Use the Template
Copy the template above and fill it out

### Step 3: Get Approval
- Link in README or main DESIGN.md
- Get team review
- Mark status as "Approved"

### Step 4: Update Main DESIGN.md
Add reference to the decision:
```markdown
## Key Decisions

1. [Phase 10: Official Data Protection](docs/design/phase-10-official-data.md)
2. [Phase 11: Mod Composition](docs/design/phase-11-composition.md)
3. [Decision 001: Service Architecture](docs/design/decision-001-service-architecture.md)
```

---

## 📝 Example: Phase 10 Decision

**File:** `docs/design/phase-10-official-data.md`

```markdown
# Phase 10: Official Data Protection

**Author:** Wafhien  
**Date:** June 2026  
**Status:** Approved  

---

## Overview

Protect official game data from accidental modification while allowing custom mods to override it.

---

## Problem

Users could accidentally delete or modify official game resources, corrupting their mod.

**Why it matters:**
- Data integrity is critical
- Users expect reversibility
- Official data should be a reference, not editable

---

## Solution

Introduced `is_official` and `is_locked` flags:
- Official resources: locked (read-only)
- Custom resources: unlocked (fully editable)
- Override system: Create new resource with `override_of_id`

### Implementation Details

```sql
ALTER TABLE resources ADD COLUMN is_official BOOLEAN DEFAULT false;
ALTER TABLE resources ADD COLUMN is_locked BOOLEAN DEFAULT false;
ALTER TABLE resources ADD COLUMN override_of_id INTEGER;
```

API validation:
```typescript
if (resource.is_locked) {
  return 403 Forbidden // Can't edit official resources
}
```

---

## Trade-offs

### What We Gain
✅ Prevents accidental data loss  
✅ Clear separation of official vs custom  
✅ Non-destructive customization  

### What We Lose
❌ Slightly more complex data model  
❌ Extra columns in database  

---

## Alternatives Considered

### Alt 1: Read-Only Database Role
Too restrictive, hard to manage access

### Alt 2: Separate Tables
Too complex, duplicate data

### Alt 3: Flags + API Validation (CHOSEN)
Simple, flexible, works well

---

## Impact

### On Development
- Services need to check is_locked before update/delete
- UI needs to show locked status
- Minimal changes to existing code

### On Performance
- Negligible (just flag checks)

### On Maintenance
- Easy to understand
- Simple to extend
```

---

## 📚 Existing Decisions to Document

Convert existing design decisions to individual files:

```
✅ Phase 10: Official Data Protection
✅ Phase 11: Mod Composition System
✅ Phase 12: Validation Engine
✅ Service-First Architecture
✅ Bulk Operations Pattern
✅ JSONB Storage Strategy
✅ Docker Infrastructure
✅ MCP Server Integration
```

---

## 🎯 For Future Phases

### Phase 13: Publishing
Create: `docs/design/phase-13-publishing.md`
- Problem: How to publish mods to Steam Workshop?
- Solution: [To be decided]
- Trade-offs: [To be evaluated]

### Phase 14: Collaboration
Create: `docs/design/phase-14-collaboration.md`
- Problem: How to enable multi-user editing?
- Solution: [To be decided]
- Trade-offs: [To be evaluated]

### Phase 15: Analytics
Create: `docs/design/phase-15-analytics.md`
- Problem: How to track usage?
- Solution: [To be decided]
- Trade-offs: [To be evaluated]

---

## 🔗 Integration Checklist

- [ ] Create `docs/design/` folder
- [ ] Move `DESIGN.md` → `DESIGN.md` (keep as main)
- [ ] Create individual decision files for each phase
- [ ] Create individual decision files for architecture choices
- [ ] Update README.md to link to design docs
- [ ] Add design decision template to wiki
- [ ] Establish review process for new decisions
- [ ] Document process in CONTRIBUTING.md

---

## 📖 How to Reference Designs

In code comments or documentation:

```markdown
See [Phase 10 Design](docs/design/phase-10-official-data.md) for why we use `is_locked` flag.

This service implements the pattern described in 
[Service Architecture Decision](docs/design/decision-001-service-architecture.md).
```

In git commits:

```
feat: Add is_locked flag to resources

Implements Phase 10 design decision to protect official data.
See docs/design/phase-10-official-data.md for rationale.
```

---

## 🚀 Benefits of This Approach

✅ **Clear Decision History** — Know why things were built this way  
✅ **Onboarding** — New team members understand architecture  
✅ **Consistency** — Same format across all decisions  
✅ **Trade-off Awareness** — Understand costs of each choice  
✅ **Future Planning** — Easy to extend for Phase 13-15  
✅ **Google Standard** — Using proven industry format  

---

## 📋 Next Steps

1. Create `docs/design/` folder
2. Create individual files for 8 existing decisions
3. Use template for all future decisions
4. Update README with design docs links
5. Add to CONTRIBUTING.md guidelines

---

**Follow this system for Phases 13-15 and beyond!** 🎯
