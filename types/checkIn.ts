
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

export interface CheckInFormData {
  employeeName: string;
  date: string;
  time: string;
  totalTime: string;
  companyId: string;
  companyName: string;
  address: string;
  contactPerson: string;
  email: string;
  phone: string;
  categories: CategoryQuantity[];
  valueMaterials: MaterialQuantity[];
  chargeMaterials: MaterialQuantity[];
  suspectedValueNote: string | null;
  otherNotes: string | null;
}

export type FormStep = 
  | 'basic-info'
  | 'categories'
  | 'value-materials'
  | 'charge-materials'
  | 'additional-notes'
  | 'review';
