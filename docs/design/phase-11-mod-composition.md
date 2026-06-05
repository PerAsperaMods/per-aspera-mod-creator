# Phase 11: Mod Composition & Layering

**Author:** Wafhien  
**Date:** June 2026  
**Status:** Approved ✅  
**Last Updated:** June 2026

---

## Overview

Enable users to layer multiple mods together with automatic conflict detection and resolution ordering.

---

## Problem

Users need to combine multiple mods while maintaining compatibility and understanding which mod's changes take precedence.

**Why it matters:**
- Single mods are limiting
- Users want to customize multiple systems (mining, farming, etc.)
- Conflicts arise naturally (2 mods modifying same resource)
- Silent conflicts cause crashes
- Resolution order matters (last mod should win)

---

## Solution

Created `CompositionService` with:
- **Dependency resolution** — Topological sort handles dependencies
- **Conflict detection** — Identifies overlapping modifications
- **Resolution ordering** — Determines final precedence
- **Caching** — Stores resolved state for performance

**How it works:**

```
User: "Compose mods: [mining_v2, factory_v1, agriculture_v1]"
    ↓
CompositionService.composeModStack()
    ├─ resolveModOrder()
    │   ├─ Get dependencies for each mod
    │   ├─ Topological sort: ["official", "factory_v1", "mining_v2", "agriculture_v1"]
    │   └─ Dependencies satisfied first
    │
    ├─ detectConflicts()
    │   ├─ mining_v2 overrides resource_aluminum
    │   ├─ agriculture_v1 doesn't override resource_aluminum
    │   └─ No conflict
    │
    └─ resolveResources()
        ├─ Start with official (41 resources)
        ├─ Apply factory_v1 (maybe adds resource_plastic)
        ├─ Apply mining_v2 (overrides resource_aluminum)
        ├─ Apply agriculture_v1 (adds resource_seed)
        └─ Final: 44 resources with mining_v2's aluminum override
    ↓
Response: {
  resolution_order: ["official", "factory_v1", "mining_v2", "agriculture_v1"],
  resolved_resources: 44,
  conflicts: []
}
```

### Implementation Details

**Database Tables:**
```sql
mods_metadata
├── mod_id (primary key)
├── name, description, version, author
└── dependencies: VARCHAR[]

mod_dependencies
├── mod_id
├── depends_on_mod_id
└── priority

mod_stacks
├── stack_id (primary key)
├── mod_ids: VARCHAR[]
├── resolution_order: VARCHAR[]
└── created_at

resolved_resources
├── stack_id, resource_id (primary key)
├── applied_mods: VARCHAR[]
└── final_definition: JSONB
```

**Service Methods:**
```typescript
async resolveModOrder(modIds: string[]): string[]
  → Returns dependency-resolved order

async composeModStack(stackId, modIds): ModStack
  → Full composition with conflicts

async getResolvedResources(stackId): Resource[]
  → Get final merged resources

async checkModConflict(modA, modB): Conflict[]
  → Pairwise conflict detection
```

---

## Trade-offs

### What We Gain ✅

1. **Powerful Composition** — Combine arbitrary mods
2. **Conflict Awareness** — Know when mods clash
3. **Resolution Clarity** — Understand precedence
4. **Dependency Support** — Mod A requires Mod B works
5. **Non-destructive** — Stack creation doesn't modify mods

### What We Lose ❌

1. **More Tables** — 3+ new database tables
2. **More Complexity** — Topological sort logic
3. **More Queries** — Dependency resolution queries
4. **More Storage** — Resolved state caching

### Why This is the Best Choice

Enables critical workflow (combining mods) while detecting issues early. Complexity is hidden in service layer, API is simple.

---

## Alternatives Considered

### Alternative 1: User Manually Resolves
**How it works:** User specifies order manually  
**Why rejected:**
- Error-prone
- Users don't understand dependencies
- Manual ordering is tedious

### Alternative 2: Always Latest Wins
**How it works:** Last mod in list always overrides all others  
**Why rejected:**
- Doesn't reflect user intent
- No conflict awareness
- Hard to debug issues

### Alternative 3: Topological Sort + Conflict Detection (CHOSEN) ✅
**How it works:**
- Resolve dependencies automatically
- Warn about conflicts
- Offer resolution order
**Why chosen:**
- User-friendly
- Safe (warns about issues)
- Professional (like build systems)

---

## Impact

### On Development
- ✅ New CompositionService (300 lines)
- ✅ 4 API endpoints
- ✅ 3 new database tables
- ✅ UI to select mods and view conflicts
- ✅ Medium complexity (~3 days to implement)

### On Performance
- ✅ Composition: ~500ms for 3 mods, 100 resources
- ✅ Caching: Instant retrieval for same stack
- ✅ No user-facing impact

### On User Experience
- ✅ See resolved order ("official → B → A → C")
- ✅ Clear conflict warnings
- ✅ Understand precedence
- ✅ Confidence in combinations

### On Maintenance
- ✅ Service encapsulation (easy to change internals)
- ✅ Proper error handling
- ✅ Testable logic

---

## Implementation Checklist

- ✅ Create mod_metadata table
- ✅ Create mod_dependencies table
- ✅ Create mod_stacks table
- ✅ Create CompositionService
- ✅ Implement resolveModOrder()
- ✅ Implement conflict detection
- ✅ Implement resource resolution
- ✅ API endpoints (compose, validate, check-conflict)
- ✅ UI for mod selection
- ✅ Show conflicts in UI
- ✅ Test dependency cycles (prevent)
- ✅ Test with multiple mods

---

## Future Considerations

**Potential Extensions:**
- **Mod marketplace** — Download community mods
- **Conflict resolution UI** — Let user choose which wins
- **Mod versioning** — Support multiple versions
- **Conditional deps** — "A requires B v2.0+"
- **Mod groups** — "Mining suite" = A + B + C

---

## References

- Code: [CompositionService.ts](../../backend/src/services/CompositionService.ts)
- Routes: [composition.ts](../../backend/src/routes/composition.ts)
- Database: [03-add-mod-composition.sql](../../db/03-add-mod-composition.sql)

---

**Status:** ✅ Implemented and tested  
**Approved by:** Wafhien  
**Next phase:** Phase 12 (Validation)
