export interface ICategory {
  id?: number;
  key: string;
  name_label: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateCategoryRequest {
  key: string;
  name_label: string;
}

export interface UpdateCategoryRequest {
  name_label?: string;
}

export interface CategoryYAML {
  [key: string]: {
    name: string;
  };
}
