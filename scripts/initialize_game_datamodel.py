#!/usr/bin/env python3
"""
Initialize Per Aspera Mod Creator with COMPLETE official game datamodel.
Reads YAML from game installation and loads into database via bulk API.
Handles custom YAML tags (!resource, !building, !technology, etc.)
"""

import yaml
import requests
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
import sys

# Configuration
GAME_DATAMODEL_PATH = Path("D:/SteamLibrary/steamapps/common/Per Aspera/datamodel")
API_BASE_URL = "http://127.0.0.1:3001"
TIMEOUT = 30
BATCH_SIZE = 100

# Custom YAML tag constructors (handle !resource, !building, etc.)
class CustomYAMLLoader(yaml.SafeLoader):
    pass

def resource_constructor(loader, node):
    return {'_ref': loader.construct_scalar(node), '_type': 'resource'}

def building_constructor(loader, node):
    return {'_ref': loader.construct_scalar(node), '_type': 'building'}

def technology_constructor(loader, node):
    return {'_ref': loader.construct_scalar(node), '_type': 'technology'}

def knowledge_constructor(loader, node):
    return {'_ref': loader.construct_scalar(node), '_type': 'knowledge'}

def project_constructor(loader, node):
    return {'_ref': loader.construct_scalar(node), '_type': 'project'}

def building_category_constructor(loader, node):
    return {'_ref': loader.construct_scalar(node), '_type': 'buildingCategory'}

def patch_constructor(loader, node):
    return loader.construct_mapping(node)

# Register custom constructors
CustomYAMLLoader.add_constructor('!resource', resource_constructor)
CustomYAMLLoader.add_constructor('!building', building_constructor)
CustomYAMLLoader.add_constructor('!technology', technology_constructor)
CustomYAMLLoader.add_constructor('!knowledge', knowledge_constructor)
CustomYAMLLoader.add_constructor('!project', project_constructor)
CustomYAMLLoader.add_constructor('!buildingCategory', building_category_constructor)
CustomYAMLLoader.add_constructor('!patch', patch_constructor)

class GameDataImporter:
    def __init__(self, api_url: str = API_BASE_URL):
        self.api_url = api_url
        self.session = requests.Session()
        self.stats = {"created": 0, "failed": 0, "skipped": 0, "categories": 0, "resources": 0, "buildings": 0, "knowledge": 0}

    def load_yaml(self, filepath: Path) -> Dict[str, Any]:
        """Load YAML file with custom tag support"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return yaml.load(f, Loader=CustomYAMLLoader) or {}
        except Exception as e:
            print(f"[ERROR] Failed to load {filepath}: {e}")
            return {}

    def post_to_api(self, endpoint: str, data: Dict) -> bool:
        """Post single item to API"""
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

    def _post_bulk(self, endpoint: str, items: List[Dict], stat_key: str = "created"):
        """Post batch of items to bulk import endpoint"""
        if not items:
            return

        try:
            payload_key = endpoint.split("/")[-1]  # "resources", "buildings", etc.
            payload = {payload_key: items}

            response = self.session.post(
                f"{self.api_url}{endpoint}",
                json=payload,
                timeout=TIMEOUT
            )

            if response.status_code in [200, 201]:
                result = response.json().get("data", {})
                imported = result.get("imported", 0)
                failed = result.get("failed", 0)
                self.stats["created"] += imported
                self.stats["failed"] += failed
                self.stats[stat_key] += imported
                print(f"  [OK] Batch: {imported} imported, {failed} failed")
            else:
                print(f"  [ERROR] {response.status_code}")
                self.stats["failed"] += len(items)
        except Exception as e:
            print(f"  [ERROR] {e}")
            self.stats["failed"] += len(items)

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

    def import_resources(self):
        """Import resources from game datamodel"""
        print("\n[INFO] Importing Resources...")
        resources_file = GAME_DATAMODEL_PATH / "resource.yaml"

        if not resources_file.exists():
            print(f"  [WARN] File not found: {resources_file}")
            return

        resources = self.load_yaml(resources_file)
        batch = []

        for key, data in resources.items():
            if not isinstance(data, dict):
                continue

            payload = {
                "key": key,
                "color": data.get("color", "FFFFFF"),
                "material_type": data.get("materialType", "Placeholder"),
                "name_label": data.get("name", key),
                "prefab_name": data.get("prefabName", key),
                "show_in_scanner": data.get("showInScannerLens", True)
            }

            batch.append(payload)

            if len(batch) >= BATCH_SIZE:
                self._post_bulk("/api/import/bulk/resources", batch, "resources")
                batch = []

        if batch:
            self._post_bulk("/api/import/bulk/resources", batch, "resources")

    def import_buildings(self):
        """Import buildings from game datamodel"""
        print("\n[INFO] Importing Buildings...")
        buildings_file = GAME_DATAMODEL_PATH / "building.yaml"

        if not buildings_file.exists():
            print(f"  [WARN] File not found: {buildings_file}")
            return

        buildings = self.load_yaml(buildings_file)
        batch = []

        for key, data in buildings.items():
            if not isinstance(data, dict):
                continue

            # Extract output resource reference
            output_res = None
            if "outputResource" in data:
                output_ref = data["outputResource"]
                if isinstance(output_ref, dict) and "_ref" in output_ref:
                    output_res = output_ref["_ref"]

            payload = {
                "key": key,
                "name_label": data.get("name", key),
                "category_key": data.get("categoryType", {}).get("_ref", "category_core") if isinstance(data.get("categoryType"), dict) else "category_core",
                "prefab_name": data.get("prefabName", key),
                "output_resource": output_res,
                "output_quantity": data.get("outputQuantity", 0),
                "power_consumption": data.get("powerConsumption", 0),
                "health": data.get("health", 100),
                "drone_capacity": data.get("droneCapacity", 0)
            }

            batch.append(payload)

            if len(batch) >= BATCH_SIZE:
                self._post_bulk("/api/import/bulk/buildings", batch, "buildings")
                batch = []

        if batch:
            self._post_bulk("/api/import/bulk/buildings", batch, "buildings")

    def import_knowledge(self):
        """Import knowledge entries"""
        print("\n[INFO] Importing Knowledge...")
        knowledge_file = GAME_DATAMODEL_PATH / "knowledge.yaml"

        if not knowledge_file.exists():
            print(f"  [WARN] File not found: {knowledge_file}")
            return

        knowledge = self.load_yaml(knowledge_file)
        batch = []

        for key, data in knowledge.items():
            if not isinstance(data, dict):
                continue

            payload = {
                "key": key,
                "name_label": data.get("name", key)
            }

            batch.append(payload)

            if len(batch) >= BATCH_SIZE:
                self._post_bulk("/api/import/bulk/knowledge", batch, "knowledge")
                batch = []

        if batch:
            self._post_bulk("/api/import/bulk/knowledge", batch, "knowledge")

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

        # Import all data
        print("\n[PHASE] Starting datamodel import...")
        self.import_categories()
        self.import_resources()
        self.import_buildings()
        self.import_knowledge()

        # Summary
        print("\n" + "=" * 50)
        print("[SUMMARY] Complete Datamodel Import:")
        print(f"  Building Categories: {self.stats.get('categories', 0)} imported")
        print(f"  Resources:           {self.stats.get('resources', 0)} imported")
        print(f"  Buildings:           {self.stats.get('buildings', 0)} imported")
        print(f"  Knowledge:           {self.stats.get('knowledge', 0)} imported")
        print(f"  ---")
        print(f"  Total Created: {self.stats['created']}")
        print(f"  Total Failed:  {self.stats['failed']}")
        print(f"  Total Skipped: {self.stats['skipped']}")
        print("\n[SUCCESS] Official game datamodel loaded!")
        print("\n[NEXT] Next steps:")
        print("  1. Visit http://127.0.0.1:3000")
        print("  2. All official game data is available")
        print("  3. Create custom mods on top!")
        print("  4. Your custom mods override game data via !patch, !replace tags")

if __name__ == "__main__":
    importer = GameDataImporter()
    importer.run()
