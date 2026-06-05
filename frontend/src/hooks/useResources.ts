import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Resource } from '../types';

export const useResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getResources();
      if (response.success && response.data) {
        setResources(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const createResource = async (data: any) => {
    try {
      const response = await apiClient.createResource(data);
      if (response.success && response.data) {
        setResources([response.data, ...resources]);
        return response.data;
      }
      throw new Error(response.error || 'Failed to create resource');
    } catch (err) {
      throw err;
    }
  };

  const updateResource = async (id: number, data: any) => {
    try {
      const response = await apiClient.updateResource(id, data);
      if (response.success && response.data) {
        setResources(resources.map((r) => (r.id === id ? response.data : r)));
        return response.data;
      }
      throw new Error(response.error || 'Failed to update resource');
    } catch (err) {
      throw err;
    }
  };

  const deleteResource = async (id: number) => {
    try {
      await apiClient.deleteResource(id);
      setResources(resources.filter((r) => r.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return { resources, loading, error, createResource, updateResource, deleteResource, refetch: fetchResources };
};
