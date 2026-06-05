export interface ResourceEntry {
  [resourceKey: string]: number;
}

export interface IBuilding {
  id?: number;
  key: string;
  name_label: string;
  description_label?: string;
  category_key: string;
  prefab_name: string;
  compact_name?: string;

  // Production
  output_resource?: string;
  output_quantity?: number;
  input_resources?: ResourceEntry;
  required_resource_vein?: string;

  // Stats
  power_consumption?: number;
  power_priority?: number;
  health?: number;
  health_loss_per_day?: number;
  progress_per_day?: number;

  // Drones/Workers
  drone_capacity?: number;
  is_worker_hub?: boolean;

  // Construction
  required_construction_resources?: ResourceEntry;

  // Visuals
  rubble_prefab_name?: string;
  icon_name?: string;
  rival_icon_name?: string;
  empty_hub_icon_name?: string;
  progress_bar_names?: string[];

  // Game
  extraction_level?: number;
  reserved_radius?: number;
  way_snap_radius?: number;
  knowledge_ref?: string;

  created_at?: Date;
  updated_at?: Date;
}

export interface CreateBuildingRequest {
  key: string;
  name_label: string;
  description_label?: string;
  category_key: string;
  prefab_name: string;
  compact_name?: string;
  output_resource?: string;
  output_quantity?: number;
  input_resources?: ResourceEntry;
  required_resource_vein?: string;
  power_consumption?: number;
  power_priority?: number;
  health?: number;
  health_loss_per_day?: number;
  progress_per_day?: number;
  drone_capacity?: number;
  is_worker_hub?: boolean;
  required_construction_resources?: ResourceEntry;
  rubble_prefab_name?: string;
  icon_name?: string;
  rival_icon_name?: string;
  empty_hub_icon_name?: string;
  progress_bar_names?: string[];
  extraction_level?: number;
  reserved_radius?: number;
  way_snap_radius?: number;
  knowledge_ref?: string;
}

export interface UpdateBuildingRequest {
  name_label?: string;
  description_label?: string;
  category_key?: string;
  prefab_name?: string;
  compact_name?: string;
  output_resource?: string;
  output_quantity?: number;
  input_resources?: ResourceEntry;
  required_resource_vein?: string;
  power_consumption?: number;
  power_priority?: number;
  health?: number;
  health_loss_per_day?: number;
  progress_per_day?: number;
  drone_capacity?: number;
  is_worker_hub?: boolean;
  required_construction_resources?: ResourceEntry;
  rubble_prefab_name?: string;
  icon_name?: string;
  rival_icon_name?: string;
  empty_hub_icon_name?: string;
  progress_bar_names?: string[];
  extraction_level?: number;
  reserved_radius?: number;
  way_snap_radius?: number;
  knowledge_ref?: string;
}

export interface BuildingYAML {
  [key: string]: {
    categoryType: {
      _ref: string;
    };
    compactName?: string;
    description?: string;
    droneCapacity?: number;
    healthLossPerDay?: number;
    inputResources?: ResourceEntry;
    knowledge?: {
      _ref: string;
    } | null;
    maxHealth?: number;
    name: string;
    outputQuantity?: number;
    outputResource?: {
      _ref: string;
    };
    powerConsumption?: number;
    powerPriority?: number;
    prefabName: string;
    rubblePrefabName?: string;
    progressPerDay?: number;
    requiredConstructionResources?: ResourceEntry;
    requiredResourceVein?: {
      _ref: string;
    };
    reservedRadius?: number;
    waySnapRadius?: number;
    iconName?: string;
    rivalIconName?: string;
    progressBarNames?: string[];
    extractionLevel?: number;
    isWorkerHub?: boolean;
    emptyHubIconName?: string;
  };
}
