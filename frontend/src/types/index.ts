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
  category_key: string;
  prefab_name: string;
  output_resource?: string;
  output_quantity?: number;
  power_consumption?: number;
  health?: number;
  drone_capacity?: number;
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
