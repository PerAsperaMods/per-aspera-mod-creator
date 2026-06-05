# Phase 10: Official Data Protection

**Author:** Wafhien  
**Date:** June 2026  
**Status:** Approved ✅  
**Last Updated:** June 2026

---

## Overview

Protect official game data from accidental modification while allowing custom mods to override it non-destructively.

---

## Problem

Users could accidentally delete or modify official game resources, corrupting their mod creation experience.

**Why it matters:**
- Data integrity is critical for user trust
- Official data should be a reference, not modifiable
- Users need ability to customize WITHOUT destroying base data
- Safety first: accidental deletion should be impossible

---

## Solution

Introduced dual-flag system for resource protection:

**Flag System:**
- `is_official: true` → Data from official game
- `is_locked: true` → Cannot be edited/deleted (enforcement)
- `override_of_id: INTEGER` → Can create override without destructing original

**How it works:**
```
Official Resource (resource_aluminum)
    ↓
    Cannot: Edit name, color, properties
    Cannot: Delete
    Can: VIEW details
    Can: CREATE override (new custom resource with override_of_id)
    ↓
Custom Override (resource_aluminum_enhanced)
    With override_of_id = resource_aluminum.id
    ↓
    Export YAML: Uses custom properties, overrides official
```

### Implementation Details

**Database Changes:**
```sql
ALTER TABLE resources ADD COLUMN is_official BOOLEAN DEFAULT false;
ALTER TABLE resources ADD COLUMN is_locked BOOLEAN DEFAULT false;
ALTER TABLE resources ADD COLUMN override_of_id INTEGER;
ALTER TABLE resources ADD COLUMN created_by VARCHAR(255);
```

**API Validation:**
```typescript
// Before UPDATE/DELETE
if (resource.is_locked) {
  throw new Error("Cannot modify official resource");
}

// Allow override creation
if (body.override_of_id) {
  // Create new resource with link to original
  return await createResource({
    ...body,
    override_of_id: body.override_of_id,
    is_official: false,
    is_locked: false
  });
}
```

**Data Initialization:**
```sql
-- Mark all imported game data as official
UPDATE resources SET is_official = true, is_locked = true 
WHERE created_at < '2026-06-05';
```

---

## Trade-offs

### What We Gain ✅

1. **Data Safety** — Prevents accidental corruption
2. **Clear Separation** — Official vs Custom is obvious
3. **Non-destructive Customization** — Override, don't destroy
4. **Audit Trail** — Can trace overrides to originals
5. **User Confidence** — "I can't break the game data"

### What We Lose ❌

1. **Slightly More Complex Schema** — Extra columns
2. **API Validation Overhead** — Must check flags
3. **UI Complexity** — Show lock indicators
4. **Database Bloat** — 4 extra columns per resource

### Why This is the Best Choice

The benefits (safety, clarity, non-destructive) vastly outweigh the costs. The overhead is minimal, and the user experience improvement is massive.

---

## Alternatives Considered

### Alternative 1: Read-Only Database Role
**How it works:** Create PostgreSQL role with SELECT-only access  
**Why rejected:** 
- Too restrictive (admin can't update official data)
- Hard to manage role switching
- Doesn't support override pattern
- Complex permission management

### Alternative 2: Separate Tables
**How it works:** 
- `resources_official` (SELECT only)
- `resources_custom` (full CRUD)  
**Why rejected:**
- Data duplication
- JOIN complexity
- Hard to track overrides
- Maintenance nightmare

### Alternative 3: Flags + API Validation (CHOSEN) ✅
**How it works:**
- Single table, flags for protection
- API checks flags before mutations
- Override system via `override_of_id`  
**Why chosen:**
- Simplest implementation
- Flexible (easy to add features)
- Clear semantics
- Scalable

---

## Impact

### On Development
- ✅ Service layer must check `is_locked` before updates
- ✅ UI must show "locked" indicator on official resources
- ✅ Override creation flow needed
- ✅ Minimal code changes (~50 lines)

### On Performance
- ✅ Negligible — Just flag checks (microseconds)
- ✅ No additional joins
- ✅ Proper indexing on `is_official`

### On User Experience
- ✅ Clear "read-only" markers
- ✅ Easy "Create Override" button
- ✅ Confidence in safety
- ✅ Non-destructive workflow

### On Maintenance
- ✅ Easy to understand
- ✅ Simple to extend (add is_archived, etc.)
- ✅ Minimal technical debt
- ✅ Clear semantics

---

## Implementation Checklist

- ✅ Add database columns
- ✅ Backfill existing resources with is_official=true
- ✅ Add API validation (check is_locked)
- ✅ Create override endpoint
- ✅ UI shows locked indicator
- ✅ Test edit/delete protection
- ✅ Test override creation
- ✅ Documentation

---

## Future Considerations

**Potential Extensions:**
- `is_archived: true` — Hide old versions
- `override_chain` — Track multiple levels
- `conflict_resolution` — When multiple overrides exist
- `version_history` — Track changes to overrides

---

## References

- Code: [OverrideService.ts](../../backend/src/services/OverrideService.ts)
- Routes: [scoped.ts](../../backend/src/routes/scoped.ts)
- API Docs: [API-ENDPOINTS.md](../../API-ENDPOINTS.md)

---

**Status:** ✅ Implemented and tested  
**Approved by:** Wafhien  
**Next phase:** Phase 11 (Mod Composition)
