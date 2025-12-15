
/**
 * API Client for Warehouse Check-In App
 * 
 * This module provides a clean interface for making API calls to your backend server.
 * Update the API_BASE_URL with your server's IP address.
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * IMPORTANT: Update this with your server's IP address
 * 
 * To find your server's IP address:
 * 1. On the CRSERV machine, open Command Prompt
 * 2. Run: ipconfig
 * 3. Look for "IPv4 Address" (e.g., 192.168.1.100)
 * 4. Update the URL below
 * 
 * Example: const API_BASE_URL = 'http://192.168.1.100:3000';
 */
const API_BASE_URL = 'http://192.168.40.239:3000'; // TODO: Update with your server IP

// ============================================================================
// TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  message?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  employee_id: string | null;
  created_at: string;
}

export interface Employee {
  id: string;
  name: string;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  address: string;
  contact_person: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Material {
  id: string;
  name: string;
  measurement: string;
  created_at: string;
}

export interface ISeriesProcessor {
  id: string;
  processor_series: string;
  processor_generation: string;
  created_at: string;
}

export interface CheckIn {
  id: string;
  employee_name: string;
  total_time: string;
  company_id: string;
  company_name: string;
  address: string;
  contact_person: string;
  email: string;
  phone: string;
  categories: any[];
  value_scrap: any[];
  charge_materials: any[];
  suspected_value_note: string;
  other_notes: string;
  created_at: string;
  started_at: string;
  finished_at: string;
  value_scrap_totals: any[];
  charge_materials_totals: any[];
  has_i_series_pcs: boolean;
  has_i_series_laptops: boolean;
  i_series_pcs: any[];
  i_series_laptops: any[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Make an API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`API Request: ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`API Error: ${response.status}`, data);
      return {
        success: false,
        error: data.error || 'Request failed',
        details: data.details,
      };
    }

    console.log(`API Success: ${endpoint}`, data);
    return data;
  } catch (error: any) {
    console.error(`API Request Failed: ${endpoint}`, error);
    return {
      success: false,
      error: 'Network error',
      details: error.message,
    };
  }
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const healthCheck = async (): Promise<ApiResponse<any>> => {
  return apiRequest('/health');
};

// ============================================================================
// AUTHENTICATION API
// ============================================================================

export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<User>> => {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  changePassword: async (
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<void>> => {
    return apiRequest('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ userId, currentPassword, newPassword }),
    });
  },

  updateEmployeePreference: async (
    userId: string,
    employeeId: string | null
  ): Promise<ApiResponse<User>> => {
    return apiRequest('/api/auth/update-employee-preference', {
      method: 'POST',
      body: JSON.stringify({ userId, employeeId }),
    });
  },
};

// ============================================================================
// EMPLOYEES API
// ============================================================================

export const employeesApi = {
  getAll: async (): Promise<ApiResponse<Employee[]>> => {
    return apiRequest('/api/employees');
  },

  getById: async (id: string): Promise<ApiResponse<Employee>> => {
    return apiRequest(`/api/employees/${id}`);
  },

  create: async (name: string): Promise<ApiResponse<Employee>> => {
    return apiRequest('/api/employees', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  update: async (id: string, name: string): Promise<ApiResponse<Employee>> => {
    return apiRequest(`/api/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest(`/api/employees/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// COMPANIES API
// ============================================================================

export const companiesApi = {
  getAll: async (): Promise<ApiResponse<Company[]>> => {
    return apiRequest('/api/companies');
  },

  create: async (company: Omit<Company, 'id' | 'created_at'>): Promise<ApiResponse<Company>> => {
    return apiRequest('/api/companies', {
      method: 'POST',
      body: JSON.stringify(company),
    });
  },

  update: async (
    id: string,
    company: Omit<Company, 'id' | 'created_at'>
  ): Promise<ApiResponse<Company>> => {
    return apiRequest(`/api/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(company),
    });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest(`/api/companies/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// CATEGORIES API
// ============================================================================

export const categoriesApi = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    return apiRequest('/api/categories');
  },

  create: async (name: string): Promise<ApiResponse<Category>> => {
    return apiRequest('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  update: async (id: string, name: string): Promise<ApiResponse<Category>> => {
    return apiRequest(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest(`/api/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// VALUE SCRAP API
// ============================================================================

export const valueScrapApi = {
  getAll: async (): Promise<ApiResponse<Material[]>> => {
    return apiRequest('/api/value-scrap');
  },

  create: async (material: Omit<Material, 'id' | 'created_at'>): Promise<ApiResponse<Material>> => {
    return apiRequest('/api/value-scrap', {
      method: 'POST',
      body: JSON.stringify(material),
    });
  },

  update: async (
    id: string,
    material: Omit<Material, 'id' | 'created_at'>
  ): Promise<ApiResponse<Material>> => {
    return apiRequest(`/api/value-scrap/${id}`, {
      method: 'PUT',
      body: JSON.stringify(material),
    });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest(`/api/value-scrap/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// CHARGE MATERIALS API
// ============================================================================

export const chargeMaterialsApi = {
  getAll: async (): Promise<ApiResponse<Material[]>> => {
    return apiRequest('/api/charge-materials');
  },

  create: async (material: Omit<Material, 'id' | 'created_at'>): Promise<ApiResponse<Material>> => {
    return apiRequest('/api/charge-materials', {
      method: 'POST',
      body: JSON.stringify(material),
    });
  },

  update: async (
    id: string,
    material: Omit<Material, 'id' | 'created_at'>
  ): Promise<ApiResponse<Material>> => {
    return apiRequest(`/api/charge-materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(material),
    });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest(`/api/charge-materials/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// I-SERIES API
// ============================================================================

export const iSeriesApi = {
  getAll: async (): Promise<ApiResponse<ISeriesProcessor[]>> => {
    return apiRequest('/api/i-series');
  },

  create: async (
    processor: Omit<ISeriesProcessor, 'id' | 'created_at'>
  ): Promise<ApiResponse<ISeriesProcessor>> => {
    return apiRequest('/api/i-series', {
      method: 'POST',
      body: JSON.stringify(processor),
    });
  },

  update: async (
    id: string,
    processor: Omit<ISeriesProcessor, 'id' | 'created_at'>
  ): Promise<ApiResponse<ISeriesProcessor>> => {
    return apiRequest(`/api/i-series/${id}`, {
      method: 'PUT',
      body: JSON.stringify(processor),
    });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest(`/api/i-series/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// CHECK-INS API
// ============================================================================

export const checkInsApi = {
  getAll: async (): Promise<ApiResponse<CheckIn[]>> => {
    return apiRequest('/api/check-ins');
  },

  getById: async (id: string): Promise<ApiResponse<CheckIn>> => {
    return apiRequest(`/api/check-ins/${id}`);
  },

  create: async (checkIn: Omit<CheckIn, 'id' | 'created_at'>): Promise<ApiResponse<CheckIn>> => {
    return apiRequest('/api/check-ins', {
      method: 'POST',
      body: JSON.stringify(checkIn),
    });
  },
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  healthCheck,
  auth: authApi,
  employees: employeesApi,
  companies: companiesApi,
  categories: categoriesApi,
  valueScrap: valueScrapApi,
  chargeMaterials: chargeMaterialsApi,
  iSeries: iSeriesApi,
  checkIns: checkInsApi,
};
