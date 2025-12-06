import { useCallback } from 'react';
import { useRealm } from '../realm';
import { KundaliData } from '../realm/kundaliSchema';

export const useKundali = () => {
  const realm = useRealm();

  const saveKundali = useCallback(async (kundaliData: Omit<KundaliData, '_id' | 'createdAt'>) => {
    try {
      const _id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      realm.write(() => {
        realm.create('Kundali', {
          _id,
          ...kundaliData,
          output: JSON.stringify(kundaliData.output), // Convert to JSON string
          createdAt: new Date(),
        } as any); // Type assertion for Realm create
      });

      return _id;
    } catch (error) {
      console.error('Error saving kundali:', error);
      throw error;
    }
  }, [realm]);

  const getKundaliById = useCallback((id: string): KundaliData | null => {
    try {
      const kundali = realm.objectForPrimaryKey('Kundali', id) as any;
      if (!kundali) return null;

      return {
        ...kundali,
        output: JSON.parse(kundali.output), // Parse back to object
      } as KundaliData;
    } catch (error) {
      console.error('Error getting kundali:', error);
      return null;
    }
  }, [realm]);

  const getAllKundalis = useCallback((): KundaliData[] => {
    try {
      const kundalis = Array.from(realm.objects('Kundali')) as any[];
      return kundalis.map(kundali => ({
        ...kundali,
        output: JSON.parse(kundali.output),
      })) as KundaliData[];
    } catch (error) {
      console.error('Error getting kundalis:', error);
      return [];
    }
  }, [realm]);

  const deleteKundali = useCallback((id: string) => {
    try {
      realm.write(() => {
        const kundali = realm.objectForPrimaryKey('Kundali', id);
        if (kundali) {
          realm.delete(kundali);
        }
      });
    } catch (error) {
      console.error('Error deleting kundali:', error);
      throw error;
    }
  }, [realm]);

  const updateKundali = useCallback((id: string, updates: Partial<KundaliData>) => {
    try {
      realm.write(() => {
        const kundali = realm.objectForPrimaryKey('Kundali', id) as any;
        if (kundali) {
          const updateData: any = { ...updates };
          if (updates.output) {
            updateData.output = JSON.stringify(updates.output);
          }
          Object.assign(kundali, updateData);
        }
      });
    } catch (error) {
      console.error('Error updating kundali:', error);
      throw error;
    }
  }, [realm]);

  return {
    saveKundali,
    getKundaliById,
    getAllKundalis,
    deleteKundali,
    updateKundali,
  };
};
