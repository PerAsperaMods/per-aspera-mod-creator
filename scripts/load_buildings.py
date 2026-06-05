#!/usr/bin/env python3
"""
Load official Per Aspera buildings from building.yaml
Handles complex YAML with tagged keys (!resource, !buildingCategory, etc.)
"""

import yaml
import requests
import json
from pathlib import Path
from typing import Dict, List, Any
import sys

API_BASE_URL = "http://127.0.0.1:3001"
GAME_DATAMODEL_PATH = Path("D:/SteamLibrary/steamapps/common/Per Aspera/datamodel")
BATCH_SIZE = 50

class ComplexYAMLLoader(yaml.SafeLoader):
    """Custom YAML loader that handles tagged keys and complex structures"""
    pass

def tagged_key_constructor(loader, tag_suffix, node):
    """Handle tagged keys like !resource key_name or !buildingCategory cat_name"""
    if isinstance(node, yaml.ScalarNode):
        return loader.construct_scalar(node)
    elif isinstance(node, yaml.MappingNode):
        return loader.construct_mapping(node)
    else:
        return loader.construct_object(node)

def resource_constructor(loader, node):
    """!resource key_name -> extract key_name"""
    return loader.construct_scalar(node)

def knowledge_constructor(loader, node):
    """!knowledge key_name -> extract key_name"""
    return loader.construct_scalar(node)

def building_category_constructor(loader, node):
    """!buildingCategory key_name -> extract key_name"""
    return loader.construct_scalar(node)

def patch_constructor(loader, node):
    """!patch {...} -> dict"""
    return loader.construct_mapping(node)

# Register constructors
ComplexYAMLLoader.add_constructor('!resource', resource_constructor)
ComplexYAMLLoader.add_constructor('!knowledge', knowledge_constructor)
ComplexYAMLLoader.add_constructor('!building', resource_constructor)
ComplexYAMLLoader.add_constructor('!buildingCategory', building_category_constructor)
ComplexYAMLLoader.add_constructor('!patch', patch_constructor)
ComplexYAMLLoader.add_constructor('!replace', patch_constructor)
ComplexYAMLLoader.add_constructor('!project', resource_constructor)
ComplexYAMLLoader.add_constructor('!technology', resource_constructor)

def load_buildings() -> List[Dict[str, Any]]:
    """Load buildings from ALL building*.yaml files (excluding buildingCategory.yaml)"""
    buildings = []

    # Find all building*.yaml files, but exclude buildingCategory.yaml
    all_files = sorted(GAME_DATAMODEL_PATH.glob("building*.yaml"))
    building_files = [f for f in all_files if f.name != "buildingCategory.yaml"]

    if not building_files:
        print("[ERROR] No building files found!")
        return []

    for building_file in building_files:
        print(f"[INFO] Loading {building_file.name}...")

        try:
            with open(building_file, 'r', encoding='utf-8') as f:
                data = yaml.load(f, Loader=ComplexYAMLLoader)
        except Exception as e:
            print(f"[ERROR] Failed to parse {building_file.name}: {e}")
            continue

        if not isinstance(data, dict):
            print(f"[WARN] {building_file.name} structure is invalid")
            continue

        file_buildings = 0
        for building_key, building_data in data.items():
            if not isinstance(building_data, dict):
                continue

            try:
                building = {
                    'key': building_key,
                    'name_label': building_data.get('name', f'BE_{building_key}'),
                    'category_key': building_data.get('categoryType', 'category_core'),
                    'prefab_name': building_data.get('prefabName', building_key),
                    'output_resource': building_data.get('outputResource'),
                    'output_quantity': float(building_data.get('outputQuantity', 0)),
                    'power_consumption': float(building_data.get('powerConsumption', 0)),
                    'health': float(building_data.get('maxHealth', 100)),
                    'drone_capacity': int(building_data.get('droneCapacity', 1)),
                    'mod_id': None,  # Official data
                    'is_official': True,
                    'is_locked': True
                }
                buildings.append(building)
                file_buildings += 1
            except Exception as e:
                print(f"  [WARN] Skipping {building_key}: {e}")
                continue

        print(f"  [OK] Loaded {file_buildings} buildings from {building_file.name}")

    print(f"\n[TOTAL] Loaded {len(buildings)} buildings from all files")
    return buildings

def post_bulk(endpoint: str, data: Dict[str, List]) -> Dict[str, Any]:
    """Post bulk data to API"""
    try:
        resp = requests.post(
            f"{API_BASE_URL}{endpoint}",
            json=data,
            timeout=30
        )
        return resp.json()
    except Exception as e:
        return {"success": False, "error": str(e)}

def main():
    print("[START] Per Aspera Building Loader")
    print("=" * 50)

    # Load buildings
    buildings = load_buildings()
    if not buildings:
        print("[ERROR] No buildings loaded!")
        return

    # Batch upload
    print(f"\n[INFO] Uploading {len(buildings)} buildings in batches...")
    total_imported = 0
    total_failed = 0

    for i in range(0, len(buildings), BATCH_SIZE):
        batch = buildings[i:i+BATCH_SIZE]
        batch_num = (i // BATCH_SIZE) + 1

        resp = post_bulk("/api/import/bulk/buildings", {"buildings": batch})

        if resp.get('success'):
            imported = len(batch)
            total_imported += imported
            print(f"  [OK] Batch {batch_num}: {imported} imported")
        else:
            error = resp.get('error', 'Unknown error')
            print(f"  [FAIL] Batch {batch_num}: {error}")
            total_failed += len(batch)

    # Summary
    print("\n" + "=" * 50)
    print(f"[SUMMARY] Building Import Complete:")
    print(f"  Total imported: {total_imported}")
    print(f"  Total failed: {total_failed}")
    print(f"  Success rate: {100 * total_imported // len(buildings) if buildings else 0}%")
    print("=" * 50)

if __name__ == "__main__":
    main()
