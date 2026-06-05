# Phases 10+ — Roadmap Complet

Plan détaillé pour la prochaine évolution du Mod Creator.

---

## **Phase 10: Official Data & Mod Override System**

### **Problem**
- Resources officielles du jeu peuvent être modifiées/supprimées
- Pas de distinction entre données officielles et mods custom
- Pas de système d'override (comme `!patch`, `!replace` en YAML)

### **Solution: Mod-Scoped Resources**

#### **1. Database Schema Update**

```sql
-- Add mod tracking to all entities
ALTER TABLE resources ADD COLUMN (
  mod_id VARCHAR(255),              -- NULL = official game data
  is_official BOOLEAN DEFAULT false, -- TRUE = can't edit/delete
  override_of_id INTEGER,             -- If NULL: new resource. If set: overrides another resource
  created_by VARCHAR(255),
  is_locked BOOLEAN DEFAULT false    -- Locked = read-only
);

CREATE INDEX idx_resources_mod_id ON resources(mod_id);
CREATE INDEX idx_resources_official ON resources(is_official);

-- Same for buildings, technologies, etc.
ALTER TABLE buildings ADD COLUMN (
  mod_id VARCHAR(255),
  is_official BOOLEAN DEFAULT false,
  override_of_id INTEGER,
  created_by VARCHAR(255),
  is_locked BOOLEAN DEFAULT false
);
```

#### **2. API Changes**

**GET /api/resources - Now returns:**
```json
{
  "official": [
    {
      "id": 1,
      "key": "resource_aluminum",
      "is_official": true,
      "is_locked": true,
      "name_label": "BE_resource_aluminum_name"
    }
  ],
  "custom": [
    {
      "id": 100,
      "key": "resource_aluminum_enhanced",
      "mod_id": "my_mod",
      "override_of_id": 1,
      "name_label": "Enhanced Aluminum"
    }
  ]
}
```

**POST /api/resources - With mod context:**
```json
{
  "key": "resource_aluminum_enhanced",
  "mod_id": "my_mod",
  "override_of_id": 1,  // If set: patch existing
  "patch": {             // Only override specific fields
    "color": "FFD700"
  }
}
```

**PUT/DELETE - Protection:**
```
Official resources (is_official=true):
  ❌ Cannot DELETE
  ❌ Cannot PUT (modify)
  ✅ Can OVERRIDE via new resource with override_of_id
  ✅ Can VIEW

Custom resources:
  ✅ Can DELETE
  ✅ Can PUT
  ✅ Can OVERRIDE others
```

#### **3. Frontend UI Changes**

**Resources page - Show both:**
```
┌─────────────────────────────────────────┐
│ OFFICIAL GAME DATA (Read-only)          │
├─────────────────────────────────────────┤
│ 🔒 resource_aluminum                    │
│    Color: C0C0C0 (locked)               │
│    [View Details] [Create Override]     │
│                                         │
│ 🔒 resource_copper                      │
│    Color: B87333 (locked)               │
├─────────────────────────────────────────┤
│ YOUR MODS                               │
├─────────────────────────────────────────┤
│ resource_aluminum_enhanced (my_mod)     │
│    Overrides: resource_aluminum         │
│    Color: FFD700                        │
│    [Edit] [Delete] [View YAML]          │
└─────────────────────────────────────────┘
```

#### **4. YAML Override System**

**Example: Override aluminum resource**

```yaml
# my_mod.yaml
resource:
  resource_aluminum_enhanced:
    name: Enhanced Aluminum
    _overrideOf: resource_aluminum  # Mark as override
    color: FFD700
    # Other fields inherit from resource_aluminum
```

**Generated YAML export:**
```yaml
# When exporting mod with override
resource:
  resource_aluminum:  # REPLACES official
    name: Enhanced Aluminum
    color: FFD700
    # Merged with official definition
```

---

## **Phase 11: Mod Layering & Composition**

### **Goal**: Create complex mods by composing multiple layers

```
Base Game (Official)
    ↓
+ Mod A (Override some resources)
    ↓
+ Mod B (Add new buildings)
    ↓
+ Mod C (Override Mod A's resources)
    ↓
= Final Mod Stack
```

### **Implementation**

```sql
-- Track mod dependencies
CREATE TABLE mod_dependencies (
  mod_id VARCHAR(255),
  depends_on_mod_id VARCHAR(255),
  priority INTEGER,  -- Order of application
  PRIMARY KEY (mod_id, depends_on_mod_id)
);

-- Resolved resource (after all overrides)
CREATE TABLE resolved_resources (
  resource_id INTEGER,
  resolved_from_id INTEGER,  -- Original official resource
  applied_mods TEXT[],        -- Array of [mod_a, mod_c]
  final_definition JSONB,     -- Merged result
  PRIMARY KEY (resource_id)
);
```

### **API**

```
POST /api/mods/compose
{
  "mod_stack": ["mod_a", "mod_b", "mod_c"],
  "base": "official"  // or another mod
}
→ Returns resolved resources with all overrides applied

GET /api/resources/:id/resolution
→ Shows how a resource got its current state (inheritance chain)
```

---

## **Phase 12: Validation & Conflict Detection**

### **Rule Engine**

```
Rule 1: Override must reference existing resource
  resource_aluminum_enhanced:
    _overrideOf: resource_aluminum  ✅
    _overrideOf: resource_nonexistent  ❌

Rule 2: Circular overrides not allowed
  A overrides B
  B overrides A  ❌

Rule 3: Type compatibility
  resource can only override resource
  building can only override building  ❌ Mixed types

Rule 4: Cross-mod validation
  Mod A overrides resource X (official)
  Mod B also overrides resource X (official)
  → Detect conflict, ask user which wins
```

### **API**

```
POST /api/validate/mod-stack
{
  "mod_stack": ["mod_a", "mod_b"],
  "strict": true  // Fail on warnings
}
→ Returns validation report with conflicts
```

---

## **Phase 13: Mod Publishing & Marketplace**

### **Goal**: Publish mods to Steam Workshop / Community

```
1. Export mod as ZIP
2. Generate manifest (dependencies, version, etc.)
3. Upload to Steam Workshop
4. Track versions & ratings
5. Auto-download community mods
```

### **API**

```
POST /api/mods/:id/publish
{
  "steam_app_id": 1695300,
  "title": "My Mod",
  "description": "...",
  "tags": ["resource", "building"],
  "change_note": "v1.1: Fixed aluminum balance"
}
→ Publishes to Steam Workshop

GET /api/steam/mods?search=aluminum
→ Lists community mods from Steam
```

---

## **Phase 14: Multi-User & Collaboration**

### **Goal**: Multiple users editing same mod

```
Mod Editor 1: Editing resources
    ↓ [Real-time sync]
Mod Editor 2: Editing buildings
    ↓ [Conflict detection]
Merged mod with both changes
```

### **Implementation**

```
WebSocket: /ws/mod/:mod_id
  - Real-time entity updates
  - Conflict resolution
  - Change notifications
  - Lock management (prevent simultaneous edits)

API:
POST /api/mods/:id/invite
{
  "email": "collaborator@example.com",
  "role": "editor"  // or "viewer"
}
```

---

## **Phase 15: Analytics & Statistics**

### **Goal**: Track mod usage, popularity, compatibility

```
POST /api/analytics/event
{
  "event": "mod_downloaded",
  "mod_id": "my_mod",
  "version": "1.2",
  "user_id": "...",
  "timestamp": "2026-06-06T10:00:00Z"
}

GET /api/mods/:id/stats
→ {
    "downloads": 1523,
    "rating": 4.7,
    "compatibility": 98.5,
    "trending": true
  }
```

---

## **Implementation Priority**

```
🔴 CRITICAL (Phase 10):
  - mod_id field on resources
  - is_official flag
  - Edit/Delete protection
  - Override system

🟡 HIGH (Phase 11-12):
  - Mod composition
  - Validation engine
  - Conflict detection

🟢 MEDIUM (Phase 13-14):
  - Publishing
  - Collaboration
  - Analytics
```

---

## **Database Migration Plan**

```sql
-- Step 1: Add columns (no data loss)
ALTER TABLE resources ADD COLUMN mod_id VARCHAR(255);
ALTER TABLE resources ADD COLUMN is_official BOOLEAN DEFAULT false;
ALTER TABLE resources ADD COLUMN override_of_id INTEGER;
ALTER TABLE resources ADD COLUMN is_locked BOOLEAN DEFAULT false;

-- Step 2: Backfill existing data
UPDATE resources SET mod_id = NULL WHERE mod_id IS NULL;
UPDATE resources SET is_official = true WHERE created_at < '2026-06-05';
UPDATE resources SET is_locked = is_official;

-- Step 3: Add indexes
CREATE INDEX idx_resources_mod_id ON resources(mod_id);
CREATE INDEX idx_resources_official ON resources(is_official);

-- Step 4: Update API to use new fields
-- No breaking changes - backward compatible
```

---

## **Timeline**

```
Phase 10: Official Data & Overrides    | 1 week
Phase 11: Mod Layering                 | 2 weeks
Phase 12: Validation & Conflicts       | 1 week
Phase 13: Publishing                   | 2 weeks
Phase 14: Multi-User Collaboration     | 2 weeks
Phase 15: Analytics                    | 1 week

Total: ~9 weeks (next 2 months)
```

---

## **Key Features Summary**

| Feature | Status | Impact |
|---------|--------|--------|
| Official data read-only | ✅ Phase 10 | Prevents accidents |
| Override system | ✅ Phase 10 | Composition model |
| Mod layering | 🔄 Phase 11 | Complex mods |
| Validation | 🔄 Phase 12 | Quality assurance |
| Publishing | 📅 Phase 13 | Community sharing |
| Collaboration | 📅 Phase 14 | Team modding |
| Analytics | 📅 Phase 15 | Growth tracking |

---

**Ready to start Phase 10?** 🚀
