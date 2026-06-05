export type MaterialType = 'Mined' | 'Manufactured' | 'Released' | 'Placeholder';

export interface IResource {
  id?: number;
  key: string;
  color: string;
  material_type: MaterialType;
  name_label: string;
  prefab_name: string;
  icon_name?: string;
  cube_material?: string;
  knowledge_ref?: string;
  show_in_scanner: boolean;
  vein_icons?: string[];
  resource_index?: number;
  // Phase 10: Mod tracking
  mod_id?: string;           // NULL = official, 'mod_name' = custom
  is_official?: boolean;     // TRUE = read-only
  override_of_id?: number;   // If set, patches another resource
  is_locked?: boolean;       // TRUE = cannot edit/delete
  created_by?: string;       // User who created it
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateResourceRequest {
  key: string;
  color: string;
  material_type: MaterialType;
  name_label: string;
  prefab_name: string;
  icon_name?: string;
  cube_material?: string;
  knowledge_ref?: string;
  show_in_scanner?: boolean;
  vein_icons?: string[];
  // Phase 10: Mod context
  mod_id?: string;           // For custom resources
  override_of_id?: number;   // To patch existing
  created_by?: string;
}

export interface UpdateResourceRequest {
  color?: string;
  material_type?: MaterialType;
  name_label?: string;
  prefab_name?: string;
  icon_name?: string;
  cube_material?: string;
  knowledge_ref?: string;
  show_in_scanner?: boolean;
  vein_icons?: string[];
}

export interface ResourceYAML {
  [key: string]: {
    color: string;
    materialType: MaterialType;
    name: string;
    prefabName: string;
    iconName?: string;
    cubeMaterial?: string;
    knowledge?: {
      _ref: string;
    };
    showInScannerLens: boolean;
    veinIcons?: string[];
    index?: number;
  };
}
