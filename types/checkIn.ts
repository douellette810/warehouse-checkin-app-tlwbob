
export interface Employee {
  id: string;
  name: string;
}

export interface Company {
  id: string;
  name: string;
  address: string;
  contact_person: string;
  email: string;
  phone: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Material {
  id: string;
  name: string;
  measurement: string;
}

export interface ISeriesProcessor {
  id: string;
  processor_series: string;
  processor_generation: string;
}

export interface CategoryQuantity {
  category: string;
  quantity: string;
}

export interface MaterialQuantity {
  materialId: string;
  materialName: string;
  quantity: string;
  measurement: string;
}

export interface MaterialTotal {
  measurement: string;
  total: number;
}

export interface ISeriesEntry {
  processorSeries: string;
  processorGeneration: string;
  quantity: string;
}

export interface CheckInFormData {
  employeeName: string;
  startedAt: string | null;
  finishedAt: string | null;
  totalTime: string;
  companyId: string;
  companyName: string;
  address: string;
  contactPerson: string;
  email: string;
  phone: string;
  categories: CategoryQuantity[];
  valueScrap: MaterialQuantity[];
  chargeMaterials: MaterialQuantity[];
  valueScrapTotals: MaterialTotal[];
  chargeMaterialsTotals: MaterialTotal[];
  hasISeriesPcs: boolean | null;
  hasISeriesLaptops: boolean | null;
  iSeriesPcs: ISeriesEntry[];
  iSeriesLaptops: ISeriesEntry[];
  suspectedValueNote: string | null;
  otherNotes: string | null;
}

export type FormStep = 
  | 'basic-info'
  | 'categories'
  | 'value-scrap'
  | 'charge-materials'
  | 'i-series'
  | 'additional-notes'
  | 'review';
