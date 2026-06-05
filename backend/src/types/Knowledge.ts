export interface IKnowledge {
  id?: number;
  key: string;
  name_label: string;
  description_label?: string;
  knowledge_type?: string;
  value?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateKnowledgeRequest {
  key: string;
  name_label: string;
  description_label?: string;
  knowledge_type?: string;
  value?: number;
}

export interface UpdateKnowledgeRequest {
  name_label?: string;
  description_label?: string;
  knowledge_type?: string;
  value?: number;
}

export interface KnowledgeYAML {
  [key: string]: {
    name: string;
    description?: string;
    knowledgeType?: string;
    value?: number;
  };
}
