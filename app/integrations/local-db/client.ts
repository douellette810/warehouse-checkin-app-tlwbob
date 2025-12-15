
// This file is no longer needed as we're using SQL Server backend
// All database operations are now handled through the API client

import { initDatabase } from './database';
import * as operations from './operations';

// This module is deprecated - use the API client instead
// Import: import api from '@/app/api/client';

let dbInitialized = false;

export const ensureDbInitialized = async () => {
  if (!dbInitialized) {
    await initDatabase();
    dbInitialized = true;
  }
};

// Export a client-like interface (deprecated - use API client instead)
export const localDb = {
  // Initialize the database
  init: ensureDbInitialized,
  
  // Table operations (all deprecated)
  employees: {
    getAll: operations.getAllEmployees,
    add: operations.addEmployee,
    update: operations.updateEmployee,
    delete: operations.deleteEmployee,
  },
  
  companies: {
    getAll: operations.getAllCompanies,
    add: operations.addCompany,
    update: operations.updateCompany,
    delete: operations.deleteCompany,
  },
  
  categories: {
    getAll: operations.getAllCategories,
    add: operations.addCategory,
    update: operations.updateCategory,
    delete: operations.deleteCategory,
  },
  
  valueScrap: {
    getAll: operations.getAllValueScrap,
    add: operations.addValueScrap,
    update: operations.updateValueScrap,
    delete: operations.deleteValueScrap,
  },
  
  chargeMaterials: {
    getAll: operations.getAllChargeMaterials,
    add: operations.addChargeMaterial,
    update: operations.updateChargeMaterial,
    delete: operations.deleteChargeMaterial,
  },
  
  iSeries: {
    getAll: operations.getAllISeries,
    add: operations.addISeries,
    update: operations.updateISeries,
    delete: operations.deleteISeries,
  },
  
  checkIns: {
    getAll: operations.getAllCheckIns,
    add: operations.addCheckIn,
  },
};
