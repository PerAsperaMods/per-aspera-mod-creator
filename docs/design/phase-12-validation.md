# Phase 12: Validation & Conflict Resolution

**Author:** Wafhien  
**Date:** June 2026  
**Status:** Approved ✅  
**Last Updated:** June 2026

---

## Overview

Enforce quality standards for mod data with 16 validation rules and auto-suggestions for fixes.

---

## Problem

Users create malformed mod data that crashes the game or breaks compatibility:
- Invalid resource keys (should be `resource_*` not `Resource_*`)
- Missing required fields (building without category)
- Type mismatches (color not hex format)
- Broken references (building references non-existent resource)

**Why it matters:**
- Bad data ruins user experience
- Silent failures are hard to debug
- Early validation prevents crashes
- Clear suggestions enable self-service fixes

---

## Solution

Created `ValidationService` with **16 hardcoded validation rules** organized by entity type.

**How it works:**

```
User: "Validate my resource"
    ↓
POST /api/validation/resource
{
  key: "resource_aluminum",
  color: "C0C0C0",
  material_type: "Mined",
  name_label: "BE_aluminum",
  prefab_name: "Aluminum"
}
    ↓
ValidationService.validateResource()
    ├─ RES_001: Key matches resource_* → ✅ PASS
    ├─ RES_002: Color is 6-char hex → ✅ PASS
    ├─ RES_003: Material type is enum → ✅ PASS
    ├─ RES_004: Name label starts BE_ → ✅ PASS
    ├─ RES_005: Prefab name exists → ✅ PASS
    └─ Result: All pass
    ↓
Response: {
  valid: true,
  messages: [],
  error_count: 0,
  warning_count: 0
}
```

### Implementation Details

**Rule Categories:**

```
RESOURCE RULES (RES_001-005):
  RES_001: Key format (resource_*)
  RES_002: Color format (6-char hex)
  RES_003: Material type enum
  RES_004: Name label localization (BE_/TXT_)
  RES_005: Prefab name required

BUILDING RULES (BLD_001-006):
  BLD_001: Key format (building_*)
  BLD_002: Category required
  BLD_003: Prefab name required
  BLD_004: Power consumption >= 0
  BLD_005: Health > 0
  BLD_006: Output quantity >= 0

COMPOSITION RULES:
  DEP_001: Dependencies in stack
  REF_001: Cross-references exist
```

**Rule Structure:**
```typescript
{
  rule_id: "RES_001",
  name: "Key format",
  severity: "error" | "warning" | "info",
  description: "Resource key must match format resource_*",
  check: (resource) => /^resource_[a-z0-9_]+$/.test(resource.key)
}
```

**Validation Levels:**

- **Error** — Fails; must fix before export
- **Warning** — Questionable; should review
- **Info** — Nice-to-know; informational only

**Auto-Suggestions:**

Each rule failure includes actionable suggestion:

```json
{
  "rule_id": "RES_001",
  "severity": "error",
  "message": "Key format invalid",
  "suggestion": "Rename to 'resource_aluminum'"
}
```

---

## Trade-offs

### What We Gain ✅

1. **Quality Gates** — Enforce standards
2. **Error Prevention** — Catch issues early
3. **Self-Service** — Suggestions enable fixes
4. **User Confidence** — "My data is valid"
5. **Clear Feedback** — Actionable errors

### What We Lose ❌

1. **Hardcoded Rules** — Not data-driven
2. **Limited Extensibility** — Need code change for new rules
3. **False Positives** — Some valid cases fail
4. **Maintenance** — Rules must be kept current

### Why This is the Best Choice

Hardcoded is fine for now; can migrate to database-driven in Phase 14+. Immediate benefit (quality gates) outweighs future maintenance.

---

## Alternatives Considered

### Alternative 1: JSON Schema
**How it works:** Validate against schema.json  
**Why rejected:**
- Doesn't support suggestions
- Less expressive
- Hard to customize

### Alternative 2: Manual User Review
**How it works:** No validation, users test in game  
**Why rejected:**
- Too late (crashes the game)
- Poor user experience
- Doesn't scale

### Alternative 3: Hardcoded Rules + Suggestions (CHOSEN) ✅
**How it works:**
- Service with rule objects
- Auto-suggestions per rule
- 3 severity levels
**Why chosen:**
- Immediate feedback
- Actionable suggestions
- Simple implementation

---

## Impact

### On Development
- ✅ New ValidationService (300 lines)
- ✅ 4 API endpoints
- ✅ 16 rules to maintain
- ✅ Low complexity

### On Performance
- ✅ Validation: ~100ms per resource
- ✅ Composition validation: ~1s for 100 resources
- ✅ No caching needed

### On User Experience
- ✅ Real-time validation feedback
- ✅ Clear error messages
- ✅ Suggestions show next step
- ✅ Can't export broken data

### On Maintenance
- ✅ Rules isolated in service
- ✅ Easy to add new rules
- ✅ Centralized logic
- ✅ Testable

---

## Implementation Checklist

- ✅ Create ValidationService
- ✅ Implement 16 rules
- ✅ Add suggestion mapping
- ✅ Create validation API endpoints
- ✅ Resource validation endpoint
- ✅ Building validation endpoint
- ✅ Composition validation endpoint
- ✅ Report generation
- ✅ UI shows errors/warnings
- ✅ Test all rules
- ✅ Test suggestions
- ✅ Test report format

---

## Future Considerations

**Potential Extensions:**

1. **Database-Driven Rules** (Phase 14+)
   - Store rules in database
   - Allow custom rules per workspace
   - Version rule sets

2. **Rule Severity Customization**
   - User chooses which rules are errors vs warnings
   - Stricter/lenient modes

3. **Quick-Fix Buttons**
   - "Fix all" button applies suggestions automatically
   - One-click resolution

4. **Integration with Phase 13 Publishing**
   - Validate before Steam Workshop upload
   - Enforce strict rules for community mods

---

## References

- Code: [ValidationService.ts](../../backend/src/services/ValidationService.ts)
- Routes: [validation.ts](../../backend/src/routes/validation.ts)
- API: POST /api/validation/{resource|building|composition}

---

**Status:** ✅ Implemented and tested  
**Approved by:** Wafhien  
**Next phase:** Phase 13 (Publishing)
