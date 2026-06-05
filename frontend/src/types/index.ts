export interface Resource {
  id: number;
  key: string;
  color: string;
  material_type: 'Mined' | 'Manufactured' | 'Released' | 'Placeholder';
  name_label: string;
  prefab_name: string;
  icon_name?: string;
  show_in_scanner: boolean;
  created_at: string;
  updated_at: string;
}

export interface Building {
  id: number;
  key: string;
  name_label: string;
  description_label?: string;
  category_key: string;
  prefab_name: string;
  compact_name?: string;
  output_resource?: string;
  output_quantity?: number;
  input_resources?: { [key: string]: number };
  required_resource_vein?: string;
  power_consumption?: number;
  power_priority?: number;
  health?: number;
  health_loss_per_day?: number;
  progress_per_day?: number;
  drone_capacity?: number;
  is_worker_hub?: boolean;
  required_construction_resources?: { [key: string]: number };
  rubble_prefab_name?: string;
  icon_name?: string;
  rival_icon_name?: string;
  empty_hub_icon_name?: string;
  progress_bar_names?: string[];
  extraction_level?: number;
  reserved_radius?: number;
  way_snap_radius?: number;
  knowledge_ref?: string;
  created_at: string;
  updated_at: string;
}

export interface Technology {
  id: number;
  key: string;
  name_label: string;
  knowledge_cost?: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  key: string;
  name_label: string;
  created_at: string;
  updated_at: string;
}

export interface Knowledge {
  id: number;
  key: string;
  name_label: string;
  created_at: string;
  updated_at: string;
}

export interface Mod {
  id?: number;
  name: string;
  mod_id: string;
  description?: string;
  resource_ids?: number[];
  building_ids?: number[];
  technology_ids?: number[];
}
