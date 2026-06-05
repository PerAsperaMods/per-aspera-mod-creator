# Per Aspera Mod Creator — YAML Integration Guide

**Status: Phase 1 — 63% Complete (418/650 items)**  
**Last Updated: 2026-06-05**

---

## 📋 Quick Reference

### Current Data Loaded
```
✅ Resources:      41/41   (100%)
✅ Buildings:      79/79   (100%)
✅ Knowledge:     241/241  (100%)
✅ Enhancements:   57/57   (100%)
❌ Technologies:    0/500+   (0%) — Blocked on Python integration
❌ Categories:      0/7     (0%) — Blocked on Python integration

Total: 418/650 (63%)
```

### Key Files
| Component | File | Purpose |
|-----------|------|---------|
| Backend Loader | `backend/src/services/YamlLoaderService.ts` | TypeScript YAML parser (partial) |
| Python Loader | `backend/yaml-loader.py` | Python PyYAML parser (NEW, ready) |
| Database | `db/init.sql` + migrations | 6 data tables |
| Admin Panel | `frontend/src/components/AdminPanel.tsx` | 4 admin functions |
| Routes | `backend/src/routes/data-management.ts` | Admin API endpoints |

---

## 🚀 Session Workflow

### Session Start Checklist
```bash
# 1. Read the status document
cat PHASE1-INTEGRATION-STATUS.md

# 2. Check current git state
git status
git log --oneline -5

# 3. Test Python loader (first priority)
python3 backend/yaml-loader.py > /tmp/yaml-output.json 2>&1
echo "Status: $?"

# 4. If errors, fix them (see "Common Issues" below)

# 5. Integrate Python output into Node.js
# → Create endpoint that spawns Python process
# → Parse JSON output and populate database

# 6. Verify 650+ items loaded
curl http://127.0.0.1:3001/api/data-management/status
```

### Session End Checklist
```bash
# 1. Commit all changes
git add -A
git commit -m "feat: Complete Phase 1 YAML integration (650+ items)"

# 2. Push to feature branch
git push origin feature/phase-8-export-mods

# 3. Save session notes
# → Update PHASE1-INTEGRATION-STATUS.md with final status
# → Note any blockers for next session

# 4. Document what's next
# → Which phase starts next (Phase 2?)
# → Any tech debt to address?
```

---

## 🔧 Technical Deep Dive

### Why Python for YAML?

**TypeScript regex approach (failed):**
- Game YAML uses custom tags: `!knowledge ref`, `- !technology ref`
- Regex to remove tags is fragile and misses edge cases
- Duplicate key detection via string parsing: error-prone
- Result: Technologies & categories never loaded (0 items)

**Python PyYAML approach (ready):**
- PyYAML natively handles custom tags
- Clean dict/list structure returned
- Proper error messages for malformed YAML
- Result: Should load 500+ technologies + 7 categories

### Python Loader Architecture

**File:** `backend/yaml-loader.py`

```python
# 1. Define GameTagConstructor
#    → Handles !knowledge, !building, !technology tags
#    → Returns plain values (ignores tag metadata)

# 2. Load files one by one
#    → technology-engineering.yaml (250+ items)
#    → technology-biology.yaml (150+ items)
#    → technology-space.yaml (100+ items)
#    → buildingCategory.yaml (7 items)

# 3. Merge results into single JSON
#    → { "technologies": {...}, "categories": {...} }

# 4. Output to stdout (captured by Node.js)
#    → Print stats first (debug)
#    → Print final JSON (data)
```

### Integration Steps

#### Step 1: Fix YAML Format Issues
```bash
# Issue 1: building.yaml has TAB at line 1768
# Fix: Replace all tabs with 2 spaces
python3 -c "
import sys
with open('backend/src/yaml-data/building.yaml', 'r') as f:
    content = f.read()
with open('backend/src/yaml-data/building.yaml', 'w') as f:
    f.write(content.replace('\t', '  '))
print('Fixed tabs')
"

# Issue 2: building-home.yaml missing
# Check if it exists elsewhere or skip it
# → If skip, remove from yaml-loader.py buildingFiles list

# Issue 3: Emojis in yaml-loader.py cause encoding errors
# Already fixed in the document above (replaced with [LOAD], [STAT], etc.)
```

#### Step 2: Test Python Script
```bash
cd backend
python3 yaml-loader.py 2>&1 | tee /tmp/yaml-test.log

# Expected output:
# [LOAD] Game datamodel from ...
# OK: Loaded 41 resources
# OK: Loaded 79 buildings
# OK: Loaded 500+ technologies
# OK: Loaded 241 knowledge  (will reload but that's ok)
# OK: Loaded 57 enhancements
# OK: Loaded 7 categories
# [STAT] Total items loaded: 925
# {...full JSON...}
```

#### Step 3: Create Node.js Integration
**File:** `backend/src/services/YamlLoaderService.ts`

Add method to call Python:
```typescript
async loadYamlUsingPython(): Promise<any> {
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process');
    const pythonProcess = spawn('python3', ['backend/yaml-loader.py']);
    
    let output = '';
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        // Extract JSON from last line
        const lines = output.trim().split('\n');
        const jsonLine = lines[lines.length - 1];
        const data = JSON.parse(jsonLine);
        
        // Insert into database
        this.insertDataIntoDatabase(data);
        resolve(data);
      } else {
        reject(new Error(`Python process failed: ${code}`));
      }
    });
  });
}
```

#### Step 4: Populate Database
After Python returns data, insert into DB:
```typescript
async insertDataIntoDatabase(data: any) {
  // For each entity type (technologies, categories)
  for (const [key, value] of Object.entries(data.technologies)) {
    await this.pool.query(`
      INSERT INTO technologies (key, name_label, ...)
      VALUES ($1, $2, ...)
      ON CONFLICT (key) DO NOTHING
    `, [key, value.name, ...]);
  }
  
  // Same for categories
  for (const [key, value] of Object.entries(data.categories)) {
    await this.pool.query(`
      INSERT INTO categories (key, name_label, ...)
      VALUES ($1, $2, ...)
      ON CONFLICT (key) DO NOTHING
    `, [key, value.name, ...]);
  }
}
```

#### Step 5: Test via API
```bash
# Trigger Python loader
curl -X POST http://127.0.0.1:3001/api/yaml-loader/load-phase-1

# Check status
curl http://127.0.0.1:3001/api/data-management/status

# Expected: 650+ total items
```

---

## 📊 What's Already Done

### Working Components ✅
1. **Admin Panel** — All 4 functions operational
   - Purge & Reload Data
   - Install SDK
   - Create C# Mod
   - Create YAML Mod

2. **Data Routes** — 5 endpoints ready
   - POST /api/data-management/purge
   - POST /api/data-management/install-sdk
   - POST /api/data-management/init-mod
   - POST /api/data-management/init-yaml-mod
   - GET /api/data-management/status

3. **Frontend** — Home page with status display
   - Shows counts: Resources, Buildings, Technologies, Knowledge, Enhancements, Categories
   - Auto-refresh every 2 seconds

4. **Database** — Schema ready
   - 6 tables: resources, buildings, technologies, knowledge, enhancements, categories
   - All have proper fields and indexes

5. **TypeScript Loaders** (partial)
   - Resources: ✅ 41/41 loaded
   - Buildings: ✅ 79/79 loaded
   - Knowledge: ✅ 241/241 loaded (fixed duplicate key issue)
   - Enhancements: ✅ 57/57 loaded

---

## 🔴 What Still Needs Work

### Priority 1: Complete Python Integration
**Expected time:** 2-3 hours

1. [ ] Fix YAML format issues (tabs, missing files)
2. [ ] Test Python script directly
3. [ ] Create Node.js wrapper that spawns Python
4. [ ] Insert Python output into database
5. [ ] Verify 650+ items in database

### Priority 2: Load Phase 2 (Game Mechanics)
**Expected time:** 1-2 days | **Items:** 400+

- Projects, quests, random events, drones
- Create new database tables
- Create Phase 2 loader service

### Priority 3: Load Phase 3 (World Generation)
**Expected time:** 1-2 days | **Items:** 300+

- POI, sites, terrain features, hazards
- Create new database tables
- Create Phase 3 loader service

### Priority 4: Complete Phases 4-5
**Expected time:** 1 day | **Items:** 300+

- Configuration, UI/cosmetic data
- Remaining tables and loaders

---

## 🐛 Common Issues & Fixes

### Issue: Python script fails with "ModuleNotFoundError: No module named 'yaml'"
**Fix:** Install PyYAML
```bash
pip install pyyaml
```

### Issue: "UnicodeEncodeError: 'charmap' codec can't encode character"
**Fix:** Already fixed in yaml-loader.py (removed emojis)

### Issue: "building-home.yaml not found"
**Fix:** Either add the file or comment it out in yaml-loader.py
```python
# for building_file in [...]:  # Remove building-home.yaml
```

### Issue: Python returns JSON but Node.js can't parse it
**Fix:** Make sure to extract ONLY the JSON line
```typescript
const lines = output.trim().split('\n');
const jsonLine = lines[lines.length - 1];  // Last line is JSON
const data = JSON.parse(jsonLine);
```

### Issue: Database insert fails with "duplicate key"
**Fix:** Use `ON CONFLICT DO NOTHING` or `ON CONFLICT DO UPDATE`
```sql
INSERT INTO technologies (...) VALUES (...) 
ON CONFLICT (key) DO UPDATE SET ... -- Or DO NOTHING
```

---

## 📈 Success Criteria

After this session completes, you should have:

```
✅ 650+ items in database (Technologies 500+, Categories 7)
✅ Python YAML loader working reliably
✅ Node.js integration spawning Python process
✅ Admin panel showing 650/2000 items
✅ No broken cross-references
✅ Translation keys auto-extracted (650+)
✅ All 5 phases planned with clear steps
```

---

## 🎓 Next Session Starting Point

If you're picking this up fresh:

1. **Read this document** — You are here
2. **Read PHASE1-INTEGRATION-STATUS.md** — What was done, what's blocked
3. **Run `python3 backend/yaml-loader.py`** — See if it works
4. **Fix any YAML errors** — Should be ~3 issues (tabs, missing file, encoding)
5. **Integrate Python into Node.js** — Create wrapper endpoint
6. **Test complete system** — Verify 650+ items loaded

Expected time to complete: **2-3 hours** (if no surprises)

---

## 📚 Reference

- **YAML Files:** `backend/src/yaml-data/*.yaml` (50 files)
- **Database Init:** `db/init.sql`
- **Admin Routes:** `backend/src/routes/data-management.ts`
- **Admin Service:** `backend/src/services/DataManagementService.ts`
- **Frontend Admin:** `frontend/src/components/AdminPanel.tsx`
- **Game Reference:** `Internal_doc/Yaml/OfficialFiles/`

---

**Last worked on:** 2026-06-05  
**Next priority:** Fix YAML + Python integration  
**Estimated completion:** 2026-06-06 (1 session)
