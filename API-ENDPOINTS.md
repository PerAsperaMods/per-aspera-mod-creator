# Per Aspera Mod Creator — Complete API Reference

**Version:** 1.0.0 | **Status:** ✅ Production Ready | **Endpoints:** 60+

---

## Base URL

```
http://127.0.0.1:3001
```

---

## API Endpoints by Category

### 🎯 Health & Docs

```
GET /                    Welcome message + links
GET /health              Health check
GET /api/docs            Interactive API documentation
```

---

### 📦 Resources (CRUD)

```
GET    /api/resources                List all resources
POST   /api/resources                Create resource
GET    /api/resources/:id            Get single resource
PUT    /api/resources/:id            Update resource
DELETE /api/resources/:id            Delete resource
GET    /api/resources/:id/yaml       Get resource as YAML
GET    /api/resources/yaml/all       Get all as YAML
```

**Example Request:**
```json
POST /api/resources
{
  "key": "resource_aluminum",
  "color": "C0C0C0",
  "material_type": "Mined",
  "name_label": "BE_resource_aluminum_name",
  "prefab_name": "Aluminum",
  "show_in_scanner": true
}
```

---

### 🏭 Buildings (CRUD)

```
GET    /api/buildings                List all buildings
POST   /api/buildings                Create building
GET    /api/buildings/:id            Get single building
PUT    /api/buildings/:id            Update building
DELETE /api/buildings/:id            Delete building
GET    /api/buildings/:id/yaml       Get as YAML
GET    /api/buildings/yaml/all       Get all as YAML
```

---

### 🔬 Technologies (CRUD)

```
GET    /api/technologies             List all
POST   /api/technologies             Create
GET    /api/technologies/:id         Get single
PUT    /api/technologies/:id         Update
DELETE /api/technologies/:id         Delete
GET    /api/technologies/:id/yaml    Get as YAML
```

---

### 📂 Categories (CRUD)

```
GET    /api/categories               List all
POST   /api/categories               Create
GET    /api/categories/:id           Get single
PUT    /api/categories/:id           Update
DELETE /api/categories/:id           Delete
```

---

### 📚 Knowledge (CRUD)

```
GET    /api/knowledge                List all
POST   /api/knowledge                Create
GET    /api/knowledge/:id            Get single
PUT    /api/knowledge/:id            Update
DELETE /api/knowledge/:id            Delete
GET    /api/knowledge/:id/yaml       Get as YAML
```

---

### 📥 Import/Export (Bulk Operations)

#### Bulk Import
```
POST /api/import/bulk/resources       Import multiple resources
POST /api/import/bulk/buildings       Import multiple buildings
POST /api/import/bulk/technologies    Import multiple technologies
POST /api/import/bulk/categories      Import multiple categories
POST /api/import/bulk/knowledge       Import multiple knowledge entries
POST /api/import/validate             Validate YAML structure
```

**Example:**
```json
POST /api/import/bulk/resources
{
  "resources": [
    {
      "key": "resource_iron",
      "color": "808080",
      "material_type": "Mined",
      "name_label": "BE_resource_iron",
      "prefab_name": "Iron"
    },
    {
      "key": "resource_copper",
      "color": "B87333",
      "material_type": "Mined",
      "name_label": "BE_resource_copper",
      "prefab_name": "Copper"
    }
  ]
}
```

#### Export
```
GET    /api/export/mod/:modId        Export mod as YAML
POST   /api/export/as-yaml           Export selected entities as YAML
GET    /api/export/mod/:modId/stats  Get mod statistics
```

---

### 🎮 Mods Management

```
GET    /api/mods                     List all mods
POST   /api/mods                     Create new mod
GET    /api/mods/:id                 Get mod details
PUT    /api/mods/:id                 Update mod
DELETE /api/mods/:id                 Delete mod
```

---

### 🔒 Scoped Data (Official vs Custom)

```
GET /api/scoped/resources                 List resources (official + custom)
GET /api/scoped/buildings                 List buildings (official + custom)
GET /api/scoped/mod/:modId/resources      Get mod's custom resources
GET /api/scoped/resource/:id/overrides    Get resource overrides
GET /api/scoped/resource/:id/resolved     Get resolved resource (merged)
POST /api/scoped/validate/override-chain  Validate override chain
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "official": [...],    // Read-only official game data
    "custom": [...]       // Editable custom mod resources
  },
  "counts": {
    "official": 41,
    "custom": 0,
    "total": 41
  }
}
```

---

### 🧩 Composition (Mod Layering)

```
POST   /api/composition/register-mod         Register mod with metadata
GET    /api/composition/mods                 List all registered mods
GET    /api/composition/mod/:modId           Get mod metadata
POST   /api/composition/compose              Compose mods into stack
GET    /api/composition/stack/:stackId/resolved    Get resolved resources
GET    /api/composition/stack/:stackId/conflicts   Get conflicts
POST   /api/composition/validate-stack       Validate mod stack
POST   /api/composition/check-conflict       Check conflict between 2 mods
```

**Register Mod:**
```json
POST /api/composition/register-mod
{
  "mod_id": "mining_enhancement_v2",
  "name": "Mining Enhancement",
  "description": "Improves mining yields",
  "version": "2.0.0",
  "author": "YourName",
  "dependencies": ["base_resources"]
}
```

**Compose Stack:**
```json
POST /api/composition/compose
{
  "stack_id": "my_game_stack",
  "mod_ids": ["mining_enhancement_v2", "factory_overhaul"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stack_id": "my_game_stack",
    "mod_ids": ["mining_enhancement_v2", "factory_overhaul"],
    "resolution_order": ["official", "mining_enhancement_v2", "factory_overhaul"],
    "resolved_resources_count": 45,
    "conflicts_count": 0,
    "conflicts": []
  }
}
```

---

### ✅ Validation (Quality Assurance)

```
POST /api/validation/resource               Validate single resource
POST /api/validation/building                Validate single building
POST /api/validation/composition             Validate mod stack
GET  /api/validation/report/:stackId        Download validation report
```

**Validate Resource:**
```json
POST /api/validation/resource
{
  "key": "resource_test",
  "color": "C0C0C0",
  "material_type": "Mined",
  "name_label": "BE_test",
  "prefab_name": "Test"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "messages": [],
    "error_count": 0,
    "warning_count": 0
  }
}
```

**Validate Composition:**
```json
POST /api/validation/composition
{
  "stack_id": "my_game_stack"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "errors": [],
    "warnings": [],
    "infos": [],
    "summary": {
      "total_checks": 45,
      "passed": 45,
      "failed": 0,
      "error_count": 0,
      "warning_count": 0
    },
    "report": "═══════════════════════════════════════\n  VALIDATION REPORT\n..."
  }
}
```

---

## Validation Rules

### Resource Rules

| Code | Severity | Rule | Example |
|------|----------|------|---------|
| RES_001 | Error | Key format: `resource_*` | `resource_aluminum` ✅ |
| RES_002 | Error | Color: 6-char hex | `C0C0C0` ✅ |
| RES_003 | Error | Material type enum | `Mined`, `Manufactured`, `Released`, `Placeholder` |
| RES_004 | Warning | Name label localization | `BE_resource_*` ✅ |
| RES_005 | Error | Prefab name required | Non-empty string |

### Building Rules

| Code | Severity | Rule | Example |
|------|----------|------|---------|
| BLD_001 | Error | Key format: `building_*` | `building_mine` ✅ |
| BLD_002 | Error | Category required | `category_mines` |
| BLD_003 | Error | Prefab name required | Non-empty string |
| BLD_004 | Warning | Power consumption >= 0 | `50` ✅ |
| BLD_005 | Warning | Health > 0 | `100` ✅ |
| BLD_006 | Info | Output quantity >= 0 | `5` ✅ |

### Composition Rules

| Code | Severity | Rule | Example |
|------|----------|------|---------|
| DEP_001 | Error | Dependencies in stack | All mods in mod_ids |
| REF_001 | Error | Cross-references exist | output_resource exists |

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Field validation failed"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Database connection failed"
}
```

---

## Common Workflows

### 1. Create a Complete Mod

```bash
# 1. Register mod
curl -X POST http://127.0.0.1:3001/api/composition/register-mod \
  -H "Content-Type: application/json" \
  -d '{
    "mod_id": "my_mining_mod",
    "name": "Mining Enhancement",
    "version": "1.0.0"
  }'

# 2. Create resources
curl -X POST http://127.0.0.1:3001/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "key": "resource_enhanced_ore",
    "color": "FF6600",
    "material_type": "Mined",
    "name_label": "BE_enhanced_ore",
    "prefab_name": "EnhancedOre",
    "mod_id": "my_mining_mod"
  }'

# 3. Create buildings
curl -X POST http://127.0.0.1:3001/api/buildings \
  -H "Content-Type: application/json" \
  -d '{
    "key": "building_enhanced_mine",
    "name_label": "BE_enhanced_mine",
    "category_key": "category_mines",
    "prefab_name": "EnhancedMine",
    "output_resource": "resource_enhanced_ore",
    "output_quantity": 10,
    "power_consumption": 75,
    "health": 150,
    "drone_capacity": 15,
    "mod_id": "my_mining_mod"
  }'

# 4. Validate
curl -X POST http://127.0.0.1:3001/api/validation/composition \
  -H "Content-Type: application/json" \
  -d '{"stack_id": "my_mining_mod"}'

# 5. Export
curl http://127.0.0.1:3001/api/export/mod/my_mining_mod
```

### 2. Compose Multiple Mods

```bash
# Compose stack
curl -X POST http://127.0.0.1:3001/api/composition/compose \
  -H "Content-Type: application/json" \
  -d '{
    "stack_id": "my_game",
    "mod_ids": ["mining_mod", "factory_mod", "agriculture_mod"]
  }'

# Check conflicts
curl -X POST http://127.0.0.1:3001/api/composition/check-conflict \
  -H "Content-Type: application/json" \
  -d '{
    "mod_a": "mining_mod",
    "mod_b": "factory_mod"
  }'

# Get validation report
curl http://127.0.0.1:3001/api/validation/report/my_game
```

### 3. Bulk Import Official Data

```bash
curl -X POST http://127.0.0.1:3001/api/import/bulk/resources \
  -H "Content-Type: application/json" \
  -d '{
    "resources": [
      {
        "key": "resource_iron",
        "color": "808080",
        "material_type": "Mined",
        "name_label": "BE_iron",
        "prefab_name": "Iron"
      },
      {
        "key": "resource_copper",
        "color": "B87333",
        "material_type": "Mined",
        "name_label": "BE_copper",
        "prefab_name": "Copper"
      }
    ]
  }'
```

---

## Rate Limiting

No rate limiting currently enforced. (To be added in future releases)

---

## CORS

Frontend and API share the same docker network. CORS is enabled for:
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://localhost:3001`
- `http://127.0.0.1:3001`

---

## Authentication

No authentication required for development/local usage. (To be added when deploying publicly)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | June 2026 | Phases 1-12 complete, 60+ endpoints, full API |

---

**For more info:** See README.md or visit http://127.0.0.1:3001/api/docs
