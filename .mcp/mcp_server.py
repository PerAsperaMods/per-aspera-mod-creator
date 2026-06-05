#!/usr/bin/env python3
"""
Per Aspera Mod Creator - MCP Server
Integrates Claude with the mod creator API for automated mod creation workflows.
"""

import json
import asyncio
import requests
from typing import Any, Dict, List, Optional
import sys

# MCP SDK (stdio-based)
class MCPServer:
    def __init__(self, api_url: str = "http://127.0.0.1:3001"):
        self.api_url = api_url
        self.session = requests.Session()
        self.tools = self._register_tools()

    def _register_tools(self) -> List[Dict[str, Any]]:
        """Register available MCP tools"""
        return [
            {
                "name": "list_resources",
                "description": "List all resources in the database",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "search": {
                            "type": "string",
                            "description": "Optional search filter"
                        },
                        "limit": {
                            "type": "integer",
                            "description": "Max results (default 50)",
                            "default": 50
                        }
                    }
                }
            },
            {
                "name": "list_buildings",
                "description": "List all buildings in the database",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "category": {
                            "type": "string",
                            "description": "Filter by category"
                        },
                        "limit": {
                            "type": "integer",
                            "description": "Max results (default 50)",
                            "default": 50
                        }
                    }
                }
            },
            {
                "name": "create_resource",
                "description": "Create a new resource",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "key": {"type": "string", "description": "Resource key (e.g., resource_aluminum)"},
                        "name_label": {"type": "string", "description": "Display name (e.g., BE_resource_aluminum_name)"},
                        "color": {"type": "string", "description": "Hex color (e.g., C0C0C0)"},
                        "material_type": {
                            "type": "string",
                            "enum": ["Mined", "Manufactured", "Released", "Placeholder"],
                            "description": "Resource type"
                        },
                        "prefab_name": {"type": "string", "description": "Prefab name in game"}
                    },
                    "required": ["key", "name_label", "color", "material_type", "prefab_name"]
                }
            },
            {
                "name": "create_building",
                "description": "Create a new building",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "key": {"type": "string", "description": "Building key"},
                        "name_label": {"type": "string", "description": "Display name"},
                        "category_key": {"type": "string", "description": "Category (e.g., category_mines)"},
                        "prefab_name": {"type": "string", "description": "Prefab name"},
                        "output_resource": {"type": "string", "description": "Output resource key (optional)"},
                        "output_quantity": {"type": "number", "description": "Output per minute"},
                        "power_consumption": {"type": "number", "description": "Power usage"},
                        "health": {"type": "number", "description": "Building health"},
                        "drone_capacity": {"type": "number", "description": "Drone capacity"}
                    },
                    "required": ["key", "name_label", "category_key", "prefab_name"]
                }
            },
            {
                "name": "bulk_import",
                "description": "Bulk import multiple resources or buildings",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "entity_type": {
                            "type": "string",
                            "enum": ["resources", "buildings", "technologies", "categories", "knowledge"],
                            "description": "Type of entities to import"
                        },
                        "items": {
                            "type": "array",
                            "description": "Array of entity objects"
                        }
                    },
                    "required": ["entity_type", "items"]
                }
            },
            {
                "name": "export_mod_yaml",
                "description": "Export a mod as YAML",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "mod_id": {"type": "string", "description": "Mod ID to export"}
                    },
                    "required": ["mod_id"]
                }
            },
            {
                "name": "validate_yaml",
                "description": "Validate YAML structure",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "yaml_data": {
                            "type": "object",
                            "description": "YAML structure to validate"
                        }
                    },
                    "required": ["yaml_data"]
                }
            },
            {
                "name": "get_mod_stats",
                "description": "Get statistics for a mod",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "mod_id": {"type": "string", "description": "Mod ID"}
                    },
                    "required": ["mod_id"]
                }
            }
        ]

    def _call_api(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """Call the backend API"""
        try:
            url = f"{self.api_url}{endpoint}"
            if method.upper() == "GET":
                resp = self.session.get(url, timeout=10)
            elif method.upper() == "POST":
                resp = self.session.post(url, json=data, timeout=10)
            else:
                return {"success": False, "error": f"Unsupported method: {method}"}

            return resp.json() if resp.status_code in [200, 201] else {
                "success": False,
                "error": f"API error {resp.status_code}: {resp.text[:200]}"
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def handle_tool_call(self, tool_name: str, tool_input: Dict[str, Any]) -> str:
        """Handle tool calls from Claude"""
        try:
            if tool_name == "list_resources":
                resp = self._call_api("GET", "/api/resources")
                return json.dumps(resp, indent=2)

            elif tool_name == "list_buildings":
                category = tool_input.get("category", "")
                endpoint = f"/api/buildings" + (f"?category={category}" if category else "")
                resp = self._call_api("GET", endpoint)
                return json.dumps(resp, indent=2)

            elif tool_name == "create_resource":
                resp = self._call_api("POST", "/api/resources", tool_input)
                return json.dumps(resp, indent=2)

            elif tool_name == "create_building":
                resp = self._call_api("POST", "/api/buildings", tool_input)
                return json.dumps(resp, indent=2)

            elif tool_name == "bulk_import":
                entity_type = tool_input.get("entity_type")
                items = tool_input.get("items", [])
                payload = {entity_type: items}
                resp = self._call_api("POST", f"/api/import/bulk/{entity_type}", payload)
                return json.dumps(resp, indent=2)

            elif tool_name == "export_mod_yaml":
                mod_id = tool_input.get("mod_id")
                resp = self._call_api("GET", f"/api/export/mod/{mod_id}")
                return json.dumps(resp, indent=2)

            elif tool_name == "validate_yaml":
                yaml_data = tool_input.get("yaml_data")
                resp = self._call_api("POST", "/api/import/validate", {"yaml": yaml_data})
                return json.dumps(resp, indent=2)

            elif tool_name == "get_mod_stats":
                mod_id = tool_input.get("mod_id")
                resp = self._call_api("GET", f"/api/export/mod/{mod_id}/stats")
                return json.dumps(resp, indent=2)

            else:
                return json.dumps({"error": f"Unknown tool: {tool_name}"})

        except Exception as e:
            return json.dumps({"error": str(e)})

    def get_tools(self) -> List[Dict[str, Any]]:
        """Return list of available tools"""
        return self.tools

    def process_message(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Process incoming MCP messages"""
        msg_type = message.get("type")

        if msg_type == "list_tools":
            return {
                "type": "list_tools",
                "tools": self.get_tools()
            }

        elif msg_type == "call_tool":
            tool_name = message.get("name")
            tool_input = message.get("input", {})
            # Handle async in sync context
            result = asyncio.run(self.handle_tool_call(tool_name, tool_input))
            return {
                "type": "tool_result",
                "name": tool_name,
                "result": result
            }

        else:
            return {"type": "error", "error": f"Unknown message type: {msg_type}"}


def main():
    """Main entry point for MCP server (stdio mode)"""
    server = MCPServer()

    print("[MCP] Per Aspera Mod Creator MCP Server Started", file=sys.stderr)
    print("[MCP] Listening on stdin/stdout", file=sys.stderr)

    try:
        while True:
            # Read from stdin
            line = sys.stdin.readline()
            if not line:
                break

            try:
                message = json.loads(line)
                response = server.process_message(message)
                print(json.dumps(response))
                sys.stdout.flush()
            except json.JSONDecodeError:
                print(json.dumps({"type": "error", "error": "Invalid JSON"}))
                sys.stdout.flush()
            except Exception as e:
                print(json.dumps({"type": "error", "error": str(e)}))
                sys.stdout.flush()

    except KeyboardInterrupt:
        print("[MCP] Server shutting down", file=sys.stderr)
        sys.exit(0)


if __name__ == "__main__":
    main()
