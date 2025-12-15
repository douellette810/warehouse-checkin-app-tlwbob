
// This file is no longer needed as we're using SQL Server backend
// All database operations are now handled through the API client at app/api/client.ts

import { getDatabase, generateUUID } from './database';
import type { 
  Employee, 
  Company, 
  Category, 
  Material, 
  ISeriesProcessor,
  CheckInFormData 
} from '@/types/checkIn';

// These functions are deprecated - use the API client instead
// Import: import api from '@/app/api/client';

export const getAllEmployees = async (): Promise<Employee[]> => {
  console.log('getAllEmployees is deprecated - use api.employees.getAll() instead');
  return [];
};

export const addEmployee = async (name: string): Promise<void> => {
  console.log('addEmployee is deprecated - use api.employees.create() instead');
};

export const updateEmployee = async (id: string, name: string): Promise<void> => {
  console.log('updateEmployee is deprecated - use api.employees.update() instead');
};

export const deleteEmployee = async (id: string): Promise<void> => {
  console.log('deleteEmployee is deprecated - use api.employees.delete() instead');
};

export const getAllCompanies = async (): Promise<Company[]> => {
  console.log('getAllCompanies is deprecated - use api.companies.getAll() instead');
  return [];
};

export const addCompany = async (company: Omit<Company, 'id' | 'created_at'>): Promise<void> => {
  console.log('addCompany is deprecated - use api.companies.create() instead');
};

export const updateCompany = async (id: string, company: Omit<Company, 'id' | 'created_at'>): Promise<void> => {
  console.log('updateCompany is deprecated - use api.companies.update() instead');
};

export const deleteCompany = async (id: string): Promise<void> => {
  console.log('deleteCompany is deprecated - use api.companies.delete() instead');
};

export const getAllCategories = async (): Promise<Category[]> => {
  console.log('getAllCategories is deprecated - use api.categories.getAll() instead');
  return [];
};

export const addCategory = async (name: string): Promise<void> => {
  console.log('addCategory is deprecated - use api.categories.create() instead');
};

export const updateCategory = async (id: string, name: string): Promise<void> => {
  console.log('updateCategory is deprecated - use api.categories.update() instead');
};

export const deleteCategory = async (id: string): Promise<void> => {
  console.log('deleteCategory is deprecated - use api.categories.delete() instead');
};

export const getAllValueScrap = async (): Promise<Material[]> => {
  console.log('getAllValueScrap is deprecated - use api.valueScrap.getAll() instead');
  return [];
};

export const addValueScrap = async (material: Omit<Material, 'id' | 'created_at'>): Promise<void> => {
  console.log('addValueScrap is deprecated - use api.valueScrap.create() instead');
};

export const updateValueScrap = async (id: string, material: Omit<Material, 'id' | 'created_at'>): Promise<void> => {
  console.log('updateValueScrap is deprecated - use api.valueScrap.update() instead');
};

export const deleteValueScrap = async (id: string): Promise<void> => {
  console.log('deleteValueScrap is deprecated - use api.valueScrap.delete() instead');
};

export const getAllChargeMaterials = async (): Promise<Material[]> => {
  console.log('getAllChargeMaterials is deprecated - use api.chargeMaterials.getAll() instead');
  return [];
};

export const addChargeMaterial = async (material: Omit<Material, 'id' | 'created_at'>): Promise<void> => {
  console.log('addChargeMaterial is deprecated - use api.chargeMaterials.create() instead');
};

export const updateChargeMaterial = async (id: string, material: Omit<Material, 'id' | 'created_at'>): Promise<void> => {
  console.log('updateChargeMaterial is deprecated - use api.chargeMaterials.update() instead');
};

export const deleteChargeMaterial = async (id: string): Promise<void> => {
  console.log('deleteChargeMaterial is deprecated - use api.chargeMaterials.delete() instead');
};

export const getAllISeries = async (): Promise<ISeriesProcessor[]> => {
  console.log('getAllISeries is deprecated - use api.iSeries.getAll() instead');
  return [];
};

export const addISeries = async (processor: Omit<ISeriesProcessor, 'id' | 'created_at'>): Promise<void> => {
  console.log('addISeries is deprecated - use api.iSeries.create() instead');
};

export const updateISeries = async (id: string, processor: Omit<ISeriesProcessor, 'id' | 'created_at'>): Promise<void> => {
  console.log('updateISeries is deprecated - use api.iSeries.update() instead');
};

export const deleteISeries = async (id: string): Promise<void> => {
  console.log('deleteISeries is deprecated - use api.iSeries.delete() instead');
};

export const getAllCheckIns = async (): Promise<any[]> => {
  console.log('getAllCheckIns is deprecated - use api.checkIns.getAll() instead');
  return [];
};

export const addCheckIn = async (checkIn: CheckInFormData): Promise<void> => {
  console.log('addCheckIn is deprecated - use api.checkIns.create() instead');
};
