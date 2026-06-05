export interface ITechnology {
  id?: number;
  key: string;
  name_label: string;
  knowledge_cost?: number;
  research_points_cost?: number;
  required_techs?: string[];
  duration_days?: number;
  building_unlock?: string;
  knowledge_ref?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateTechnologyRequest {
  key: string;
  name_label: string;
  knowledge_cost?: number;
  research_points_cost?: number;
  required_techs?: string[];
  duration_days?: number;
  building_unlock?: string;
  knowledge_ref?: string;
}

export interface UpdateTechnologyRequest {
  name_label?: string;
  knowledge_cost?: number;
  research_points_cost?: number;
  required_techs?: string[];
  duration_days?: number;
  building_unlock?: string;
  knowledge_ref?: string;
}

export interface TechnologyYAML {
  [key: string]: {
    name: string;
    knowledgeCost?: number;
    researchPointsCost?: number;
    requiredTechs?: {
      _ref: string;
    }[];
    durationDays?: number;
    buildingUnlock?: {
      _ref: string;
    };
    knowledge?: {
      _ref: string;
    };
  };
}
