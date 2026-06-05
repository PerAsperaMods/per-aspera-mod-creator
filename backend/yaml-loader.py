#!/usr/bin/env python3
"""
YAML Loader pour Per Aspera game datamodel
Utilise PyYAML pour parser les fichiers YAML avec tags personnalisés
"""

import yaml
import json
import sys
from pathlib import Path
from typing import Any, Dict

# Path to YAML data
YAML_DATA_PATH = Path(__file__).parent / "src/yaml-data"


class GameTagConstructor:
    """Handle game-specific YAML tags (!knowledge, !building, etc.)"""

    @staticmethod
    def tag_constructor(loader, tag_suffix, node):
        """Convert tagged values to plain values (ignore the tag)"""
        if isinstance(node, yaml.ScalarNode):
            return loader.construct_scalar(node)
        elif isinstance(node, yaml.SequenceNode):
            return loader.construct_sequence(node)
        elif isinstance(node, yaml.MappingNode):
            return loader.construct_mapping(node)
        return None


def load_yaml_file(file_path: Path) -> Dict[str, Any]:
    """Load YAML file with custom tag handling"""
    try:
        # Create custom YAML loader
        loader = yaml.SafeLoader

        # Register constructors for all custom tags
        tags = [
            "knowledge",
            "building",
            "buildingCategory",
            "technology",
            "resource",
            "project",
            "quest",
            "enhancement",
            "randomEvent",
            "hazard",
            "poi",
            "site",
            "replace",
            "patch",
        ]

        for tag in tags:
            yaml.add_constructor(
                f"!{tag}",
                lambda l, n, t=tag: GameTagConstructor.tag_constructor(l, t, n),
                Loader=loader,
            )

        with open(file_path, "r", encoding="utf-8") as f:
            content = yaml.load(f, Loader=loader)

        return content or {}

    except Exception as e:
        print(f"❌ Error loading {file_path.name}: {e}", file=sys.stderr)
        return {}


def load_game_datamodel() -> Dict[str, Any]:
    """Load all game datamodel files"""
    result = {
        "resources": {},
        "buildings": {},
        "technologies": {},
        "knowledge": {},
        "enhancements": {},
        "categories": {},
    }

    # Load resources
    resources_data = load_yaml_file(YAML_DATA_PATH / "resource.yaml")
    result["resources"] = resources_data or {}
    print(f"✅ Loaded {len(result['resources'])} resources")

    # Load buildings (3 files)
    for building_file in [
        "building.yaml",
        "building-greenmars.yaml",
        "building-home.yaml",
    ]:
        building_data = load_yaml_file(YAML_DATA_PATH / building_file)
        result["buildings"].update(building_data or {})
    print(f"✅ Loaded {len(result['buildings'])} buildings")

    # Load technologies (3 files)
    for tech_file in [
        "technology-engineering.yaml",
        "technology-biology.yaml",
        "technology-space.yaml",
    ]:
        tech_data = load_yaml_file(YAML_DATA_PATH / tech_file)
        result["technologies"].update(tech_data or {})
    print(f"✅ Loaded {len(result['technologies'])} technologies")

    # Load knowledge
    knowledge_data = load_yaml_file(YAML_DATA_PATH / "knowledge.yaml")
    result["knowledge"] = knowledge_data or {}
    print(f"✅ Loaded {len(result['knowledge'])} knowledge entries")

    # Load enhancements
    enhancements_data = load_yaml_file(YAML_DATA_PATH / "enhancements.yaml")
    result["enhancements"] = enhancements_data or {}
    print(f"✅ Loaded {len(result['enhancements'])} enhancements")

    # Load categories
    categories_data = load_yaml_file(YAML_DATA_PATH / "buildingCategory.yaml")
    if categories_data and "buildingCategory" in categories_data:
        result["categories"] = categories_data["buildingCategory"]
    print(f"✅ Loaded {len(result['categories'])} categories")

    return result


if __name__ == "__main__":
    print(f"📦 Loading game datamodel from {YAML_DATA_PATH}...")

    data = load_game_datamodel()

    # Print summary
    total = sum(len(v) for v in data.values())
    print(f"\n📊 Total items loaded: {total}")
    print(
        json.dumps(
            {
                key: len(value) for key, value in data.items()
            },
            indent=2,
        )
    )

    # Output as JSON
    print(json.dumps(data))
