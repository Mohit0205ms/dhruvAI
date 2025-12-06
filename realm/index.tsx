import Realm from 'realm';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { KundaliSchema } from './kundaliSchema';

const schemas = [KundaliSchema];

export const getRealm = async (): Promise<Realm> => {
  return await Realm.open({
    schema: schemas,
    schemaVersion: 1,
    onMigration: (oldRealm, newRealm) => {
      // Handle migrations if needed in future versions
    },
  });
};

// React Context for Realm
const RealmContext = createContext<Realm | null>(null);

export const useRealm = () => {
  const realm = useContext(RealmContext);
  if (!realm) {
    throw new Error('useRealm must be used within a RealmProvider');
  }
  return realm;
};

export const RealmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [realm, setRealm] = useState<Realm | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initRealm = async () => {
      try {
        const realmInstance = await getRealm();
        setRealm(realmInstance);
      } catch (error) {
        console.error('Failed to initialize Realm:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initRealm();

    return () => {
      if (realm) {
        realm.close();
      }
    };
  }, []);

  if (isLoading) {
    return null; // Or return a loading component
  }

  if (!realm) {
    return null; // Or return an error component
  }

  return (
    <RealmContext.Provider value={realm}>
      {children}
    </RealmContext.Provider>
  );
};
