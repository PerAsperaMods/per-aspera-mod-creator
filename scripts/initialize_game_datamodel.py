#!/usr/bin/env python3
"""
Initialize Per Aspera Mod Creator with official game datamodel.
Reads YAML from game installation and loads into database via API.
"""

import yaml
import requests
import json
from pathlib import Path
from typing import Dict, List, Any

# Configuration
GAME_DATAMODEL_PATH = Path("D:/SteamLibrary/steamapps/common/Per Aspera/datamodel")
API_BASE_URL = "http://127.0.0.1:3001"
TIMEOUT = 10

class GameDataImporter:
    def __init__(self, api_url: str = API_BASE_URL):
        self.api_url = api_url
        self.session = requests.Session()
        self.stats = {"created": 0, "failed": 0, "skipped": 0}

    def load_yaml(self, filepath: Path) -> Dict[str, Any]:
        """Load YAML file"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f) or {}
        except Exception as e:
            print(f"[ERROR] Failed to load {filepath}: {e}")
            return {}

    def post_to_api(self, endpoint: str, data: Dict) -> bool:
        """Post data to API"""
        try:
            response = self.session.post(
                f"{self.api_url}{endpoint}",
                json=data,
                timeout=TIMEOUT
            )
            if response.status_code in [200, 201]:
                self.stats["created"] += 1
                return True
            else:
                print(f"  [WARN] {response.status_code}: {response.text[:100]}")
                self.stats["failed"] += 1
                return False
        except Exception as e:
            print(f"  [ERROR] {e}")
            self.stats["failed"] += 1
            return False

    def import_categories(self):
        """Import building categories"""
        print("\n[INFO] Importing Building Categories...")
        categories_file = GAME_DATAMODEL_PATH / "buildingCategory.yaml"

        if not categories_file.exists():
            print(f"  [WARN] File not found: {categories_file}")
            return

        categories = self.load_yaml(categories_file)

        for key, data in categories.items():
            payload = {
                "key": key,
                "name_label": data.get("name", key)
            }

            if self.post_to_api("/api/categories", payload):
                print(f"  [OK] {key}")
            else:
                print(f"  [FAIL] {key}")

    def import_knowledge(self):
        """Import knowledge entries"""
        print("\n[INFO] Importing Knowledge...")
        knowledge_file = GAME_DATAMODEL_PATH / "knowledge.yaml"

        if not knowledge_file.exists():
            print(f"  [WARN] File not found: {knowledge_file}")
            return

        knowledge = self.load_yaml(knowledge_file)

        for key, data in knowledge.items():
            payload = {
                "key": key,
                "name_label": data.get("name", key),
                "description_label": data.get("description", ""),
                "knowledge_type": data.get("type", "general"),
                "value": data.get("value", 1)
            }

            if self.post_to_api("/api/knowledge", payload):
                print(f"  [OK] {key}")
            else:
                print(f"  [FAIL] {key}")

    def get_all_yaml_files(self) -> List[Path]:
        """Get all YAML files from datamodel"""
        return sorted(GAME_DATAMODEL_PATH.rglob("*.yaml"))

    def run(self):
        """Run the import process"""
        print("[START] Per Aspera Game Datamodel Importer")
        print("=" * 50)

        # Check API connectivity
        print(f"\n[INFO] Connecting to API: {self.api_url}")
        try:
            response = self.session.get(f"{self.api_url}/health", timeout=5)
            if response.status_code == 200:
                print("  [OK] API is running")
            else:
                print(f"  [ERROR] API returned {response.status_code}")
                return
        except Exception as e:
            print(f"  [ERROR] Cannot connect to API: {e}")
            print(f"     Make sure backend is running: docker-compose up")
            return

        # Check datamodel exists
        if not GAME_DATAMODEL_PATH.exists():
            print(f"\n[ERROR] Game datamodel not found: {GAME_DATAMODEL_PATH}")
            print("   Install Per Aspera at: D:\\SteamLibrary\\steamapps\\common\\Per Aspera\\")
            return

        print(f"\n[INFO] Game Datamodel: {GAME_DATAMODEL_PATH}")
        yaml_files = self.get_all_yaml_files()
        print(f"   Found {len(yaml_files)} YAML files")

        # Import data
        self.import_categories()
        self.import_knowledge()

        # Summary
        print("\n" + "=" * 50)
        print("[SUMMARY] Import Results:")
        print(f"  Created: {self.stats['created']}")
        print(f"  Failed:  {self.stats['failed']}")
        print(f"  Skipped: {self.stats['skipped']}")
        print("\n[NEXT] Next steps:")
        print("  1. Visit http://127.0.0.1:3000")
        print("  2. Your game data is now available!")
        print("  3. Create mods on top of the official datamodel")

if __name__ == "__main__":
    importer = GameDataImporter()
    importer.run()
