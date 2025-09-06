# API Documentation

## Overview

The Freelancian API follows REST principles and provides endpoints for managing financial entries, generating reports, and importing data. All endpoints return JSON responses and use standard HTTP status codes.

## Base URL

```
Production: https://your-app.vercel.app/api
Development: http://localhost:3000/api
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Optional success message",
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_123456789"
}
```

### Error Response (RFC 7807 Problem Details)
```json
{
  "success": false,
  "error": {
    "type": "https://freelancian.com/errors/validation-error",
    "title": "Validation Error",
    "status": 400,
    "detail": "The request contains invalid data",
    "instance": "/api/entries",
    "errors": {
      "title": ["Title is required"],
      "priceGrossThb": ["Amount must be positive"]
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_123456789"
}
```

## Authentication

Currently, the MVP does not require authentication as it's designed for single-user usage. Future versions will implement authentication.

## Endpoints

### Entries Management

#### GET /api/entries

Retrieve a paginated list of entries with optional filtering.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 50, max: 100)
- `kind` (string, optional): Filter by entry type ("income" | "expense")
- `month` (string, optional): Filter by month (format: "YYYY-MM")
- `search` (string, optional): Search in title, client, or vendor name
- `sortBy` (string, optional): Sort field ("date" | "amount" | "title", default: "date")
- `sortOrder` (string, optional): Sort direction ("asc" | "desc", default: "desc")
- `clientName` (string, optional): Filter by client name
- `vendorName` (string, optional): Filter by vendor name

**Example Request:**
```bash
GET /api/entries?kind=income&month=2024-01&page=1&limit=20
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx123456789",
      "kind": "income",
      "title": "Voice Over Project",
      "docDate": "2024-01-15T00:00:00Z",
      "transferDate": "2024-01-20T00:00:00Z",
      "clientName": "ABC Company",
      "vendorName": null,
      "productService": "Voice Over Services",
      "accountName": "Business Account",
      "priceGrossThb": 7000.00,
      "vatThb": 490.00,
      "withholdingThb": 210.00,
      "commissionThb": 0.00,
      "totalNetThb": 7280.00,
      "project": "Commercial Campaign",
      "remark": "30-second commercial",
      "invoiceNo": "INV-2024-001",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "links": {
    "self": "/api/entries?page=1&limit=20",
    "first": "/api/entries?page=1&limit=20",
    "last": "/api/entries?page=3&limit=20",
    "next": "/api/entries?page=2&limit=20"
  }
}
```

#### POST /api/entries

Create a new entry.

**Request Body:**
```json
{
  "kind": "income",
  "title": "Voice Over Project",
  "docDate": "2024-01-15",
  "transferDate": "2024-01-20",
  "clientName": "ABC Company",
  "productService": "Voice Over Services",
  "accountName": "Business Account",
  "priceGrossThb": 7000.00,
  "vatThb": 490.00,
  "withholdingThb": 210.00,
  "commissionThb": 0.00,
  "project": "Commercial Campaign",
  "remark": "30-second commercial",
  "invoiceNo": "INV-2024-001"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "clx123456789",
    "kind": "income",
    "title": "Voice Over Project",
    // ... full entry object
  },
  "message": "Entry created successfully"
}
```

#### GET /api/entries/[id]

Retrieve a single entry by ID.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx123456789",
    "kind": "income",
    "title": "Voice Over Project",
    // ... full entry object
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "type": "https://freelancian.com/errors/not-found",
    "title": "Entry Not Found",
    "status": 404,
    "detail": "Entry with ID 'clx123456789' was not found",
    "instance": "/api/entries/clx123456789"
  }
}
```

#### PUT /api/entries/[id]

Update an entire entry (replaces all fields).

**Request Body:** Same as POST /api/entries

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    // ... updated entry object
  },
  "message": "Entry updated successfully"
}
```

#### PATCH /api/entries/[id]

Partially update an entry (updates only provided fields).

**Request Body:**
```json
{
  "title": "Updated Voice Over Project",
  "priceGrossThb": 8000.00
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    // ... updated entry object
  },
  "message": "Entry updated successfully"
}
```

#### DELETE /api/entries/[id]

Delete an entry.

**Response (204 No Content):**
No response body.

### Reports and Analytics

#### GET /api/reports/dashboard

Get dashboard summary metrics for the current month.

**Query Parameters:**
- `month` (string, optional): Specific month (format: "YYYY-MM", default: current month)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalIncome": 25000.00,
    "totalExpenses": 8500.00,
    "netAmount": 16500.00,
    "entryCount": {
      "income": 8,
      "expense": 12,
      "total": 20
    },
    "trends": {
      "incomeChange": 15.5,
      "expenseChange": -8.2,
      "netChange": 22.1
    }
  }
}
```

#### GET /api/reports/trends

Get monthly trend data for charts and analysis.

**Query Parameters:**
- `months` (number, optional): Number of months to include (default: 12, max: 24)
- `startMonth` (string, optional): Starting month (format: "YYYY-MM")

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "month": "2024-01",
      "totalIncome": 25000.00,
      "totalExpenses": 8500.00,
      "netAmount": 16500.00,
      "entryCount": 20
    },
    {
      "month": "2024-02",
      "totalIncome": 28000.00,
      "totalExpenses": 9200.00,
      "netAmount": 18800.00,
      "entryCount": 22
    }
  ]
}
```

### Data Import

#### POST /api/import/preview

Preview CSV data before importing.

**Request Body (multipart/form-data):**
- `file`: CSV file
- `kind`: "income" | "expense"

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "preview": [
      {
        "row": 1,
        "data": {
          "title": "Voice Over Project",
          "amount": "7000",
          "date": "2024-01-15",
          "client": "ABC Company"
        },
        "mapped": {
          "title": "Voice Over Project",
          "priceGrossThb": 7000.00,
          "docDate": "2024-01-15T00:00:00Z",
          "clientName": "ABC Company"
        },
        "valid": true,
        "errors": []
      }
    ],
    "summary": {
      "totalRows": 50,
      "validRows": 48,
      "invalidRows": 2,
      "previewRows": 10
    },
    "fieldMappings": {
      "title": "Title",
      "amount": "Amount",
      "date": "Date",
      "client": "Client Name"
    }
  }
}
```

#### POST /api/import/execute

Execute the CSV import after preview.

**Request Body:**
```json
{
  "kind": "income",
  "fieldMappings": {
    "title": "Title",
    "amount": "Amount",
    "date": "Date",
    "client": "Client Name"
  },
  "data": [
    // ... array of mapped entry objects
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "imported": 48,
    "skipped": 2,
    "errors": [
      {
        "row": 15,
        "error": "Invalid date format",
        "data": {...}
      }
    ]
  },
  "message": "Import completed successfully"
}
```

## Data Models

### Entry Model

```typescript
interface Entry {
  id: string;                    // Unique identifier (CUID)
  kind: 'income' | 'expense';    // Entry type
  title: string;                 // Entry description
  docDate?: Date;                // Document/work date
  transferDate?: Date;           // Payment/transfer date
  
  // Client/Vendor information
  clientName?: string;           // Client name (for income)
  vendorName?: string;           // Vendor name (for expenses)
  productService?: string;       // Product or service description
  accountName?: string;          // Account used for transaction
  
  // Financial amounts (Thai Baht)
  priceGrossThb?: number;        // Gross amount before taxes
  vatThb?: number;               // VAT amount (7%)
  withholdingThb?: number;       // Withholding tax (3%)
  commissionThb?: number;        // Commission/fees
  totalNetThb?: number;          // Computed net total
  
  // Additional information
  project?: string;              // Project name/reference
  remark?: string;               // Additional notes
  invoiceNo?: string;            // Invoice number
  
  // Timestamps
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last update timestamp
}
```

### Validation Rules

#### Entry Validation
- `kind`: Required, must be "income" or "expense"
- `title`: Required, 1-255 characters
- `docDate`: Optional, cannot be in the future
- `transferDate`: Optional, cannot be in the future
- `priceGrossThb`: Optional, must be non-negative
- `vatThb`: Optional, must be non-negative
- `withholdingThb`: Optional, must be non-negative, cannot exceed 3% of gross amount
- `commissionThb`: Optional, must be non-negative

#### Business Rules
- For income entries: `totalNetThb = priceGrossThb + vatThb - withholdingThb - commissionThb`
- For expense entries: `totalNetThb = priceGrossThb + vatThb - withholdingThb`
- Withholding tax should not exceed 3% of gross amount (warning, not error)
- All monetary amounts are stored with 2 decimal precision

## HTTP Status Codes

- `200 OK`: Successful GET, PUT, PATCH requests
- `201 Created`: Successful POST requests
- `204 No Content`: Successful DELETE requests
- `400 Bad Request`: Invalid request format or data
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate)
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Unexpected server error
- `503 Service Unavailable`: Temporary service unavailability

## Rate Limiting

Currently no rate limiting is implemented. Future versions will include:
- 100 requests per minute per IP for general endpoints
- 10 requests per minute for import endpoints
- 1000 requests per hour for authenticated users

## Caching

- Dashboard metrics: Cached for 5 minutes
- Trend reports: Cached for 1 hour
- Entry lists: No caching (real-time data)

## Error Handling

All errors follow RFC 7807 Problem Details format with:
- `type`: URI identifying the problem type
- `title`: Human-readable summary
- `status`: HTTP status code
- `detail`: Human-readable explanation
- `instance`: URI identifying the specific occurrence
- `errors`: Field-specific validation errors (when applicable)

## Examples

### Complete Entry Creation Flow

```bash
# 1. Create a new income entry
curl -X POST https://your-app.vercel.app/api/entries \
  -H "Content-Type: application/json" \
  -d '{
    "kind": "income",
    "title": "Website Development",
    "docDate": "2024-01-15",
    "clientName": "Tech Startup",
    "priceGrossThb": 15000.00,
    "vatThb": 1050.00,
    "withholdingThb": 450.00
  }'

# 2. Get dashboard metrics
curl https://your-app.vercel.app/api/reports/dashboard

# 3. Search for entries
curl "https://your-app.vercel.app/api/entries?search=website&kind=income"
```

This API documentation provides comprehensive information for integrating with the Freelancian API and understanding the data structures used throughout the application.