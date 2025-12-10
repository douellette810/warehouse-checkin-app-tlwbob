
# API Reference - Quick Guide

## Base URL

```
http://<YOUR_SERVER_IP>:3000
```

Replace `<YOUR_SERVER_IP>` with your CRSERV machine's IP address (e.g., `192.168.1.100`)

---

## 🏥 Health Check

### Check API Status
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Warehouse API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected"
}
```

---

## 👥 Employees

### Get All Employees
```http
GET /api/employees
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "created_at": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Get Single Employee
```http
GET /api/employees/:id
```

### Create Employee
```http
POST /api/employees
Content-Type: application/json

{
  "name": "John Doe"
}
```

### Update Employee
```http
PUT /api/employees/:id
Content-Type: application/json

{
  "name": "John Smith"
}
```

### Delete Employee
```http
DELETE /api/employees/:id
```

---

## 🏢 Companies

### Get All Companies
```http
GET /api/companies
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Acme Corp",
      "address": "123 Main St",
      "contact_person": "Jane Doe",
      "email": "jane@acme.com",
      "phone": "555-1234",
      "created_at": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Create Company
```http
POST /api/companies
Content-Type: application/json

{
  "name": "Acme Corp",
  "address": "123 Main St",
  "contact_person": "Jane Doe",
  "email": "jane@acme.com",
  "phone": "555-1234"
}
```

### Update Company
```http
PUT /api/companies/:id
Content-Type: application/json

{
  "name": "Acme Corporation",
  "address": "456 Oak Ave",
  "contact_person": "Jane Smith",
  "email": "jane@acme.com",
  "phone": "555-5678"
}
```

### Delete Company
```http
DELETE /api/companies/:id
```

---

## 📦 Categories

### Get All Categories
```http
GET /api/categories
```

### Create Category
```http
POST /api/categories
Content-Type: application/json

{
  "name": "Electronics"
}
```

### Update Category
```http
PUT /api/categories/:id
Content-Type: application/json

{
  "name": "Electronic Waste"
}
```

### Delete Category
```http
DELETE /api/categories/:id
```

---

## ♻️ Value Scrap

### Get All Value Scrap
```http
GET /api/value-scrap
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Copper Wire",
      "measurement": "Lbs.",
      "created_at": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Create Value Scrap
```http
POST /api/value-scrap
Content-Type: application/json

{
  "name": "Copper Wire",
  "measurement": "Lbs."
}
```

### Update Value Scrap
```http
PUT /api/value-scrap/:id
Content-Type: application/json

{
  "name": "Copper Cable",
  "measurement": "Lbs."
}
```

### Delete Value Scrap
```http
DELETE /api/value-scrap/:id
```

---

## ⚡ Charge Materials

### Get All Charge Materials
```http
GET /api/charge-materials
```

### Create Charge Material
```http
POST /api/charge-materials
Content-Type: application/json

{
  "name": "Steel Scrap",
  "measurement": "Lbs."
}
```

### Update Charge Material
```http
PUT /api/charge-materials/:id
Content-Type: application/json

{
  "name": "Steel Scrap",
  "measurement": "Tons"
}
```

### Delete Charge Material
```http
DELETE /api/charge-materials/:id
```

---

## 💻 i-Series Processors

### Get All i-Series
```http
GET /api/i-series
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "processor_series": "i5",
      "processor_generation": "10th",
      "created_at": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Create i-Series
```http
POST /api/i-series
Content-Type: application/json

{
  "processor_series": "i7",
  "processor_generation": "11th"
}
```

### Update i-Series
```http
PUT /api/i-series/:id
Content-Type: application/json

{
  "processor_series": "i7",
  "processor_generation": "12th"
}
```

### Delete i-Series
```http
DELETE /api/i-series/:id
```

---

## 📋 Check-Ins

### Get All Check-Ins
```http
GET /api/check-ins
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "employee_name": "John Doe",
      "total_time": "2.5",
      "company_id": "uuid",
      "company_name": "Acme Corp",
      "address": "123 Main St",
      "contact_person": "Jane Doe",
      "email": "jane@acme.com",
      "phone": "555-1234",
      "categories": [
        { "category": "Electronics", "quantity": "100" }
      ],
      "value_scrap": [
        { "materialName": "Copper Wire", "quantity": "50", "measurement": "Lbs." }
      ],
      "charge_materials": [],
      "suspected_value_note": "Some valuable items",
      "other_notes": "No damages",
      "created_at": "2024-01-15T10:00:00.000Z",
      "started_at": "2024-01-15T09:00:00.000Z",
      "finished_at": "2024-01-15T10:00:00.000Z",
      "value_scrap_totals": [
        { "measurement": "Lbs.", "total": 50 }
      ],
      "charge_materials_totals": [],
      "has_i_series_pcs": true,
      "has_i_series_laptops": false,
      "i_series_pcs": [
        { "processorSeries": "i5", "processorGeneration": "10th", "quantity": "5" }
      ],
      "i_series_laptops": []
    }
  ]
}
```

### Get Single Check-In
```http
GET /api/check-ins/:id
```

### Create Check-In
```http
POST /api/check-ins
Content-Type: application/json

{
  "employee_name": "John Doe",
  "total_time": "2.5",
  "company_id": "uuid",
  "company_name": "Acme Corp",
  "address": "123 Main St",
  "contact_person": "Jane Doe",
  "email": "jane@acme.com",
  "phone": "555-1234",
  "categories": [
    { "category": "Electronics", "quantity": "100" }
  ],
  "value_scrap": [
    { "materialName": "Copper Wire", "quantity": "50", "measurement": "Lbs." }
  ],
  "charge_materials": [],
  "suspected_value_note": "Some valuable items",
  "other_notes": "No damages",
  "started_at": "2024-01-15T09:00:00.000Z",
  "value_scrap_totals": [
    { "measurement": "Lbs.", "total": 50 }
  ],
  "charge_materials_totals": [],
  "has_i_series_pcs": true,
  "has_i_series_laptops": false,
  "i_series_pcs": [
    { "processorSeries": "i5", "processorGeneration": "10th", "quantity": "5" }
  ],
  "i_series_laptops": []
}
```

---

## 🔧 Using the API in React Native

### Import the API Client
```typescript
import api from '@/app/api/client';
```

### Examples

#### Fetch Employees
```typescript
const response = await api.employees.getAll();
if (response.success) {
  console.log('Employees:', response.data);
} else {
  console.error('Error:', response.error);
}
```

#### Create Employee
```typescript
const response = await api.employees.create('John Doe');
if (response.success) {
  console.log('Created:', response.data);
}
```

#### Update Employee
```typescript
const response = await api.employees.update('uuid', 'John Smith');
if (response.success) {
  console.log('Updated:', response.data);
}
```

#### Delete Employee
```typescript
const response = await api.employees.delete('uuid');
if (response.success) {
  console.log('Deleted successfully');
}
```

#### Create Check-In
```typescript
const checkInData = {
  employee_name: 'John Doe',
  total_time: '2.5',
  company_id: 'uuid',
  company_name: 'Acme Corp',
  // ... rest of the data
};

const response = await api.checkIns.create(checkInData);
if (response.success) {
  console.log('Check-in created:', response.data);
}
```

---

## 🚨 Error Handling

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information"
}
```

### Example Error Handling
```typescript
const response = await api.employees.create('John Doe');

if (response.success) {
  // Success
  console.log('Employee created:', response.data);
} else {
  // Error
  console.error('Error:', response.error);
  if (response.details) {
    console.error('Details:', response.details);
  }
}
```

---

## 🧪 Testing with cURL

### Test Health Check
```bash
curl http://192.168.1.100:3000/health
```

### Test Get Employees
```bash
curl http://192.168.1.100:3000/api/employees
```

### Test Create Employee
```bash
curl -X POST http://192.168.1.100:3000/api/employees \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe"}'
```

### Test Create Company
```bash
curl -X POST http://192.168.1.100:3000/api/companies \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Acme Corp",
    "address":"123 Main St",
    "contact_person":"Jane Doe",
    "email":"jane@acme.com",
    "phone":"555-1234"
  }'
```

---

## 📝 Notes

- Replace `192.168.1.100` with your actual server IP address
- All POST/PUT requests require `Content-Type: application/json` header
- UUIDs are automatically generated by SQL Server
- Timestamps are automatically set by SQL Server
- JSON fields (categories, value_scrap, etc.) are automatically parsed

---

## 🔗 Related Documentation

- `BACKEND_SETUP_GUIDE.md` - Complete setup instructions
- `app/api/README.md` - Detailed API documentation
- `app/api/server-template.js` - Server implementation
- `app/api/client.ts` - TypeScript API client
