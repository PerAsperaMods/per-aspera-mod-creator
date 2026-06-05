import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Building, Category, Resource } from '../types';

export const useBuildings = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [bResp, cResp, rResp] = await Promise.all([
          apiClient.getBuildings(),
          apiClient.getCategories(),
          apiClient.getResources(),
        ]);

        if (bResp.success && bResp.data) setBuildings(bResp.data);
        if (cResp.success && cResp.data) setCategories(cResp.data);
        if (rResp.success && rResp.data) setResources(rResp.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const createBuilding = async (data: any) => {
    try {
      const response = await apiClient.createBuilding(data);
      if (response.success && response.data) {
        setBuildings([response.data, ...buildings]);
        return response.data;
      }
      throw new Error(response.error || 'Failed to create building');
    } catch (err) {
      throw err;
    }
  };

  const updateBuilding = async (id: number, data: any) => {
    try {
      const response = await apiClient.updateBuilding(id, data);
      if (response.success && response.data) {
        setBuildings(buildings.map((b) => (b.id === id ? response.data : b)));
        return response.data;
      }
      throw new Error(response.error || 'Failed to update building');
    } catch (err) {
      throw err;
    }
  };

  const deleteBuilding = async (id: number) => {
    try {
      await apiClient.deleteBuilding(id);
      setBuildings(buildings.filter((b) => b.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    buildings,
    categories,
    resources,
    loading,
    error,
    createBuilding,
    updateBuilding,
    deleteBuilding,
  };
};
