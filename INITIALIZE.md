# Initialize with Game Datamodel

Load the official Per Aspera game datamodel into your mod creator.

## Prerequisites

1. **Per Aspera installed** at `D:\SteamLibrary\steamapps\common\Per Aspera\`
2. **Application running** with `docker-compose up`
3. **Python 3.8+** with PyYAML installed

## Installation

### 1. Install Python dependencies

```bash
pip install pyyaml requests
```

### 2. Run the initialization script

```bash
python scripts/initialize_game_datamodel.py
```

## What Gets Imported

The script loads:

- ✅ **Building Categories** (Mines, Factories, Power, Terraforming, etc.)
- ✅ **Knowledge Entries** (Game knowledge definitions)
- 🔄 **Resources** (coming soon)
- 🔄 **Buildings** (coming soon)
- 🔄 **Technologies** (coming soon)

## Output

```
🎮 Per Aspera Game Datamodel Importer
==================================================

🔗 Connecting to API: http://127.0.0.1:3001
  ✅ API is running

📁 Game Datamodel: D:\SteamLibrary\steamapps\common\Per Aspera\datamodel
   Found 117 YAML files

📂 Importing Building Categories...
  ✅ category_core
  ✅ category_mines
  ✅ category_factories
  ... (and more)

📚 Importing Knowledge...
  ✅ knowledge_basic
  ✅ knowledge_advanced
  ... (and more)

==================================================
📊 Import Summary:
  ✅ Created: 45
  ❌ Failed: 0
  ⏭️ Skipped: 0

💡 Next steps:
  1. Visit http://127.0.0.1:3000
  2. Your game data is now available!
  3. Create mods on top of the official datamodel
```

## Troubleshooting

### ❌ "Cannot connect to API"
```bash
# Make sure backend is running
docker-compose up

# Or restart it
docker-compose restart backend
```

### ❌ "Game datamodel not found"
```
Install Per Aspera at: D:\SteamLibrary\steamapps\common\Per Aspera\
```

### ❌ "ModuleNotFoundError: No module named 'yaml'"
```bash
pip install pyyaml
```

## What's Next?

1. **Visit the app:** http://127.0.0.1:3000
2. **View imported data:** Click any category (Resources, Buildings, etc.)
3. **Create your mod:** Start creating custom buildings using the official categories

## Advanced

### Customize which data to import

Edit `scripts/initialize_game_datamodel.py` and comment/uncomment sections in the `run()` method:

```python
def run(self):
    # ...
    self.import_categories()      # ← Uncomment to import
    self.import_knowledge()       # ← Uncomment to import
    # self.import_buildings()     # ← Add more importers
    # self.import_resources()
```

### Add more importers

The script uses a plugin architecture. To add more data types:

```python
def import_resources(self):
    """Import resources"""
    print("\n📦 Importing Resources...")
    resources_file = GAME_DATAMODEL_PATH / "resource.yaml"
    # ... similar pattern to import_categories()
```

---

**Ready to use your game data!** 🚀
