# Datamodel Integration Plan — Complete

**Objective:** Load 100% of official Per Aspera game data into Mod Creator  
**Status:** 30% complete (resources + knowledge + categories)  
**Remaining:** 70% (buildings + technologies + enhancements + projects + assets)

---

## 📊 Data Inventory

### Current State
```
✅ Resources:        41/41 loaded
✅ Knowledge:        241/241 loaded
✅ Categories:       7/7 loaded
❌ Buildings:        0/500+ (YAML parsing issue)
❌ Technologies:     0/500+ (not loaded)
❌ Enhancements:     0/100+ (not loaded)
❌ Projects:         0/100+ (not loaded)
❌ Hazards:          0/10+ (not loaded)
❌ Quests:           0/50+ (not loaded)
❌ Popups:           0/100+ (not loaded)
❌ Assets/Sprites:   0/1932 (not integrated)
```

### Files to Load (by priority)

**PRIORITY 1 (Core Game Data):**
```
1. building.yaml           - 69 KB  - 500+ buildings (MAIN ISSUE: YAML parsing)
2. technology-*.yaml       - 57 KB  - Technologies (3 files: biology, engineering, space)
3. project.yaml            - 54 KB  - Projects/research tree
4. enhancements.yaml       - 15 KB  - Building enhancements
```

**PRIORITY 2 (Secondary Systems):**
```
5. popup.yaml              - 9 KB   - Dialog popups & notifications
6. hazard-*.yaml           - 5 KB   - Hazards (asteroid, sandstorm, devil)
7. quest-*.yaml            - 4 KB   - Quests & missions
8. terraformingPlan*.yaml  - 6 KB   - Terraforming plans
```

**PRIORITY 3 (Config & Setup):**
```
9. InitialSetup.yaml       - 4 KB   - Initial game state
10. PlanetSetup.yaml       - 12 KB  - Planet configuration
11. poi.yaml               - 510 KB - Points of Interest (LARGE)
12. site.yaml              - 40 KB  - Sites/locations
```

**PRIORITY 4 (Assets):**
```
13. Sprites                - 1932 PNG files
    Path: F:\ModPeraspera_Raw_Extrac\extrat\Sprite
    Usage: Resource icons, building icons, UI elements
```

---

## 🔧 Current Issues & Solutions

### Issue 1: Building.yaml YAML Parsing Error

**Error:**
```
Found unhashable key in building.yaml, line 20
```

**Cause:** Likely `!patch` tag or complex mapping structure  
**Solution:** Need to:
1. Inspect line 20 of building.yaml
2. Add proper YAML constructors for `!patch`, `!replace`, etc.
3. Or use custom YAML loader that handles complex structures

### Issue 2: Missing Technology Constructors

**Current:** Only basic tags supported  
**Needed:** 
- `!technology` references
- `!project` references
- Potential `!replace`, `!patch` tags

### Issue 3: Asset/Sprite Integration

**Current:** No asset system  
**Needed:**
1. Database table for sprite metadata
2. API endpoint to serve sprites
3. Link sprites to resources/buildings by name matching
4. Frontend component to display sprite previews

---

## 📋 Integration Strategy

### Phase 1: Fix Core Data Loading (Week 1)

**Step 1.1: Fix YAML Parsing**
```
- Add comprehensive YAML tag constructors
- Test with building.yaml
- Add error handling for malformed entries
- Log which entries fail to parse
```

**Step 1.2: Load Buildings (500+)**
```python
# Create table
CREATE TABLE buildings_official (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE,
  name_label VARCHAR(255),
  category_key VARCHAR(255),
  prefab_name VARCHAR(255),
  output_resource VARCHAR(255),
  output_quantity FLOAT,
  power_consumption FLOAT,
  health FLOAT,
  drone_capacity INT,
  data JSONB,  -- Store complex fields
  is_official BOOLEAN DEFAULT true,
  is_locked BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

# Script:
python scripts/load_buildings.py

# Verification:
GET /api/scoped/buildings → Should show 500+ official buildings
```

**Step 1.3: Load Technologies (500+)**
```python
# 3 files:
- technology-biology.yaml (research path)
- technology-engineering.yaml (infrastructure)
- technology-space.yaml (space exploration)

# Create table
CREATE TABLE technologies_official (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE,
  name_label VARCHAR(255),
  knowledge_cost INT,
  requires_technology VARCHAR(255)[],
  data JSONB,
  is_official BOOLEAN DEFAULT true,
  is_locked BOOLEAN DEFAULT true
);

# Script:
python scripts/load_technologies.py

# Verification:
GET /api/technologies → Should show 500+ items
```

**Step 1.4: Load Enhancements & Projects (200+)**
```python
# Files:
- enhancements.yaml (building upgrades)
- project.yaml (research tree)

# Link to existing resources/buildings

# Verification:
GET /api/enhancements → Enhancement list
```

### Phase 2: Secondary Systems (Week 2)

**Step 2.1: Load Hazards, Quests, Popups (100+)**
```python
python scripts/load_hazards.py
python scripts/load_quests.py
python scripts/load_popups.py
```

**Step 2.2: Load Setup & Configuration (20+)**
```python
python scripts/load_setup_configs.py
```

### Phase 3: Asset Integration (Week 3)

**Step 3.1: Create Sprite System**
```sql
CREATE TABLE assets_sprites (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255),
  category VARCHAR(50),  -- 'resource', 'building', 'ui', etc.
  entity_key VARCHAR(255),  -- e.g., 'resource_aluminum'
  path VARCHAR(500),
  width INT,
  height INT,
  created_at TIMESTAMP
);
```

**Step 3.2: Index Sprites (1932 files)**
```bash
python scripts/index_sprites.py
# Matches sprite filenames to resource/building keys

Example:
- Sprite: "resource_aluminum.png" → resource_aluminum
- Sprite: "building_mine.png" → building_mine
```

**Step 3.3: Frontend Integration**
```
- Show sprite preview in resource/building editor
- Gallery view for all sprites
- Search sprites by name
```

---

## 🔨 Implementation Steps

### Immediate (Today)

**1. Diagnose Building.yaml Issue**
```bash
# Read lines 15-25 of building.yaml to see exact issue
head -25 D:\SteamLibrary\steamapps\common\Per Aspera\datamodel\building.yaml
```

**2. Create Comprehensive YAML Loader**
```python
# File: backend/src/services/YamlLoaderService.ts
class YamlLoaderService {
  - Add all missing constructors
  - Handle !patch, !replace, etc.
  - Error recovery for malformed entries
  - Detailed logging
}
```

**3. Create Building Loader Script**
```python
# File: scripts/load_buildings.py
- Parse building.yaml with fixed loader
- Extract: key, name, category, prefab, output, power, health, etc.
- Bulk import via API
- Log success/failures
```

**4. Test Loading**
```bash
python scripts/load_buildings.py
# Should load 500+ buildings into database
```

### Next Week

**5. Load Technologies (3 files)**
**6. Load Enhancements & Projects**
**7. Load Secondary Systems**

### Following Week

**8. Create Asset System**
**9. Index 1932 Sprites**
**10. Frontend Sprite Integration**

---

## 📊 Success Metrics

### Phase 1 Complete
```
✅ Buildings: 500+ loaded
✅ Technologies: 500+ loaded
✅ Enhancements: 100+ loaded
✅ Projects: 100+ loaded
Total official data: 1500+ items

Check:
GET /api/scoped/buildings → 500+ official buildings
GET /api/technologies → 500+ items
```

### Phase 2 Complete
```
✅ Hazards: 10+ loaded
✅ Quests: 50+ loaded
✅ Popups: 100+ loaded
✅ Config: 20+ loaded
Total: +180 items
```

### Phase 3 Complete
```
✅ Sprites indexed: 1932 images
✅ Asset system: Working
✅ Frontend display: Showing previews
✅ Search functional
```

### Final State
```
✅ Total items loaded: 2000+
✅ All YAML files parsed: 50/50
✅ All entity types supported
✅ Asset system operational
✅ Ready for production mod creation
```

---

## 📝 Database Schema Updates Needed

```sql
-- Add if not exists
ALTER TABLE resources ADD COLUMN IF NOT EXISTS sprite_id INT;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS sprite_id INT;
ALTER TABLE technologies ADD COLUMN IF NOT EXISTS sprite_id INT;

-- Create assets table
CREATE TABLE IF NOT EXISTS assets_sprites (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255),
  entity_type VARCHAR(50),
  entity_key VARCHAR(255),
  file_path VARCHAR(500),
  width INT,
  height INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(filename)
);

CREATE TABLE IF NOT EXISTS enhancements (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE,
  name_label VARCHAR(255),
  building_key VARCHAR(255),
  data JSONB,
  is_official BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS technologies (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE,
  name_label VARCHAR(255),
  knowledge_cost INT,
  requires_technology VARCHAR(255)[],
  data JSONB,
  is_official BOOLEAN DEFAULT true,
  is_locked BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hazards (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE,
  name_label VARCHAR(255),
  data JSONB,
  is_official BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quests (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE,
  name_label VARCHAR(255),
  description TEXT,
  data JSONB,
  is_official BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎯 Priority Focus

**RIGHT NOW:**
1. ✅ Understand building.yaml issue
2. ✅ Create enhanced YAML loader
3. ✅ Load buildings (500+)
4. ✅ Verify in database

**Then:**
5. Load technologies
6. Load enhancements
7. Load secondary data
8. Asset integration

**Do NOT continue to Phase 13+ until this is 100% complete!**

---

## ✅ Completion Checklist

- [ ] Building.yaml parsing fixed
- [ ] 500+ buildings loaded
- [ ] 500+ technologies loaded
- [ ] 100+ enhancements loaded
- [ ] 100+ projects loaded
- [ ] 10+ hazards loaded
- [ ] 50+ quests loaded
- [ ] 100+ popups loaded
- [ ] 1932 sprites indexed
- [ ] Asset system operational
- [ ] Frontend shows previews
- [ ] All 50 YAML files processed
- [ ] 2000+ items in database
- [ ] Documentation complete
- [ ] Ready for production

---

**FOCUS:** Complete datamodel integration before moving to Phase 13!
