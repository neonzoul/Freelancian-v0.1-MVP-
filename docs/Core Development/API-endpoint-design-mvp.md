# API Endpoint Design - MVP v0.1

## Overview

Simplified API design for MVP focusing on manual entry functionality. No authentication, payment, or AI features - just clean CRUD operations with excellent UX support.

---

## 1) Design Principles

1. **RESTful design** with resource-oriented URLs
2. **Single user mode** (no authentication for MVP)
3. **Consistent response formats** with proper HTTP status codes
4. **Input validation** with detailed error messages
5. **Performance optimized** with pagination and filtering
6. **Future-ready** structure for easy auth integration

---

## 2) Base Configuration

**Base URL**: `/api/v1/`
**Content-Type**: `application/json`
**Authentication**: None (MVP single user mode)

---

## 3) Core Endpoints

### Entries Management

#### Get Entries

```http
GET /api/v1/entries
```

**Query Parameters**:

-   `kind` (optional): `income` | `expense`
-   `month` (optional): `YYYY-MM` format
-   `limit` (optional): number, default 50, max 100
-   `offset` (optional): number, default 0
-   `sort` (optional): `date_desc` | `date_asc` | `amount_desc` | `amount_asc`

**Response 200**:

```json
{
    "data": [
        {
            "id": "entry_123",
            "kind": "income",
            "title": "Voice Over Project",
            "doc_date": "2025-09-01",
            "transfer_date": "2025-09-05",
            "client_name": "ACME Corp",
            "product_service": "Voice Over",
            "account_name": "KBank",
            "price_gross_thb": 7000.0,
            "vat_thb": 0.0,
            "withholding_thb": 210.0,
            "commission_thb": 0.0,
            "total_net_thb": 6790.0,
            "project": "Q3 Campaign",
            "remark": "Final payment",
            "invoice_no": "INV-001",
            "created_at": "2025-09-05T10:00:00Z",
            "updated_at": "2025-09-05T10:00:00Z"
        }
    ],
    "pagination": {
        "total": 42,
        "limit": 50,
        "offset": 0,
        "has_more": false
    }
}
```

#### Create Entry

```http
POST /api/v1/entries
```

**Request Body**:

```json
{
    "kind": "income",
    "title": "Voice Over Project",
    "doc_date": "2025-09-01",
    "transfer_date": "2025-09-05",
    "client_name": "ACME Corp",
    "product_service": "Voice Over",
    "account_name": "KBank",
    "price_gross_thb": 7000.0,
    "vat_thb": 0.0,
    "withholding_thb": 210.0,
    "commission_thb": 0.0,
    "project": "Q3 Campaign",
    "remark": "Final payment",
    "invoice_no": "INV-001"
}
```

**Response 201**:

```json
{
    "data": {
        "id": "entry_123",
        "total_net_thb": 6790.0
    },
    "message": "Entry created successfully"
}
```

#### Get Single Entry

```http
GET /api/v1/entries/{id}
```

**Response 200**:

```json
{
    "data": {
        // Full entry object
    }
}
```

#### Update Entry

```http
PUT /api/v1/entries/{id}
```

**Request Body**: Same as create (partial updates allowed)

**Response 200**:

```json
{
    "data": {
        "id": "entry_123",
        "total_net_thb": 6790.0
    },
    "message": "Entry updated successfully"
}
```

#### Delete Entry

```http
DELETE /api/v1/entries/{id}
```

**Response 204**: No content

---

### Reports & Analytics

#### Dashboard Summary

```http
GET /api/v1/reports/summary
```

**Query Parameters**:

-   `month` (optional): `YYYY-MM` format, defaults to current month

**Response 200**:

```json
{
    "data": {
        "period": "2025-09",
        "total_income": 50000.0,
        "total_expenses": 15000.0,
        "net_amount": 35000.0,
        "entry_count": {
            "income": 8,
            "expense": 12,
            "total": 20
        },
        "top_clients": [
            {
                "name": "ACME Corp",
                "total_amount": 25000.0,
                "entry_count": 3
            }
        ],
        "top_expense_categories": [
            {
                "category": "Equipment",
                "total_amount": 8000.0,
                "entry_count": 2
            }
        ]
    }
}
```

#### Monthly Trends

```http
GET /api/v1/reports/trends
```

**Query Parameters**:

-   `months` (optional): number of months back, default 12

**Response 200**:

```json
{
    "data": {
        "months": [
            {
                "month": "2025-09",
                "total_income": 50000.0,
                "total_expenses": 15000.0,
                "net_amount": 35000.0,
                "entry_count": 20
            }
        ]
    }
}
```

---

### Data Import

#### Import from CSV

```http
POST /api/v1/import/csv
```

**Request Body** (multipart/form-data):

-   `file`: CSV file
-   `type`: `income` | `expense`
-   `mapping`: JSON object mapping CSV columns to entry fields

**Response 200**:

```json
{
    "data": {
        "imported_count": 15,
        "skipped_count": 2,
        "error_count": 0,
        "errors": []
    },
    "message": "Import completed successfully"
}
```

#### Preview CSV Import

```http
POST /api/v1/import/csv/preview
```

**Request Body**: Same as import

**Response 200**:

```json
{
    "data": {
        "columns": ["List", "Transfer Date", "Price ฿", "VAT 7% ฿"],
        "sample_rows": [["Voice Over Project", "2025-09-01", "7000", "0"]],
        "suggested_mapping": {
            "List": "title",
            "Transfer Date": "transfer_date",
            "Price ฿": "price_gross_thb",
            "VAT 7% ฿": "vat_thb"
        }
    }
}
```

---

## 4) Validation Schemas

### Entry Validation

```typescript
const EntrySchema = z
    .object({
        kind: z.enum(['income', 'expense']),
        title: z.string().min(1, 'Title is required').max(255),
        doc_date: z.string().date().optional(),
        transfer_date: z.string().date().optional(),
        client_name: z.string().max(255).optional(),
        vendor_name: z.string().max(255).optional(),
        product_service: z.string().max(255).optional(),
        account_name: z.string().max(255).optional(),
        price_gross_thb: z.number().nonnegative().optional(),
        vat_thb: z.number().nonnegative().optional(),
        withholding_thb: z.number().nonnegative().optional(),
        commission_thb: z.number().nonnegative().optional(),
        project: z.string().max(255).optional(),
        remark: z.string().max(500).optional(),
        invoice_no: z.string().max(255).optional(),
    })
    .refine(
        (data) => {
            // Withholding validation (3% rule)
            if (data.price_gross_thb && data.withholding_thb) {
                return data.withholding_thb <= data.price_gross_thb * 0.03;
            }
            return true;
        },
        {
            message: 'Withholding cannot exceed 3% of gross amount',
            path: ['withholding_thb'],
        }
    );
```

---

## 5) Error Handling

### Standard Error Response Format

```json
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid input data",
        "details": {
            "title": ["Title is required"],
            "price_gross_thb": ["Must be a positive number"]
        }
    },
    "request_id": "req_123456"
}
```

### Error Codes

| Code               | Status | Description             |
| ------------------ | ------ | ----------------------- |
| `VALIDATION_ERROR` | 400    | Input validation failed |
| `NOT_FOUND`        | 404    | Resource not found      |
| `DUPLICATE_ERROR`  | 409    | Resource already exists |
| `INTERNAL_ERROR`   | 500    | Server error            |
| `RATE_LIMIT_ERROR` | 429    | Too many requests       |

---

## 6) Response Patterns

### Success Response Structure

```json
{
    "data": {}, // Actual response data
    "message": "Success message", // Optional
    "meta": {} // Optional metadata
}
```

### List Response Structure

```json
{
    "data": [], // Array of items
    "pagination": {
        "total": 100,
        "limit": 50,
        "offset": 0,
        "has_more": true
    }
}
```

### Error Response Structure

```json
{
    "error": {
        "code": "ERROR_CODE",
        "message": "Human readable message",
        "details": {} // Additional error details
    },
    "request_id": "unique_request_id"
}
```

---

## 7) Rate Limiting (Future-Ready)

### Rate Limits

-   **General API**: 100 requests per minute per IP
-   **Import endpoints**: 5 requests per minute per IP
-   **Reports endpoints**: 30 requests per minute per IP

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1630000000
```

---

## 8) CORS Configuration

```javascript
// Next.js API route CORS
const cors = {
    origin:
        process.env.NODE_ENV === 'production'
            ? ['https://yourapp.com']
            : ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};
```

---

## 9) API Versioning Strategy

### Current Version

-   **v1**: MVP features (manual entry, reports, import)

### Future Versions

-   **v2**: Add user authentication and multi-user support
-   **v3**: Add payment integration and premium features
-   **v4**: Add AI parsing and advanced features

### Version Header

```http
Accept: application/vnd.freelancian.v1+json
```

---

## 10) TypeScript Types

### API Client Types

```typescript
// Request/Response types
export interface CreateEntryRequest {
    kind: 'income' | 'expense';
    title: string;
    doc_date?: string;
    transfer_date?: string;
    client_name?: string;
    vendor_name?: string;
    product_service?: string;
    account_name?: string;
    price_gross_thb?: number;
    vat_thb?: number;
    withholding_thb?: number;
    commission_thb?: number;
    project?: string;
    remark?: string;
    invoice_no?: string;
}

export interface Entry extends CreateEntryRequest {
    id: string;
    total_net_thb: number;
    created_at: string;
    updated_at: string;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
    meta?: Record<string, any>;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        has_more: boolean;
    };
}

export interface ApiError {
    error: {
        code: string;
        message: string;
        details?: Record<string, string[]>;
    };
    request_id: string;
}
```

---

## 11) Testing Strategy

### API Testing

```typescript
// Example API test
describe('POST /api/v1/entries', () => {
    it('should create income entry with correct calculations', async () => {
        const entry = {
            kind: 'income' as const,
            title: 'Test Income',
            price_gross_thb: 10000,
            vat_thb: 700,
            withholding_thb: 300,
        };

        const response = await request(app)
            .post('/api/v1/entries')
            .send(entry)
            .expect(201);

        expect(response.body.data.total_net_thb).toBe(10400);
    });
});
```

---

## 12) Documentation

### OpenAPI Specification

```yaml
openapi: 3.0.0
info:
    title: Freelancian API
    version: 1.0.0
    description: Finance tracking API for freelancers

paths:
    /api/v1/entries:
        get:
            summary: List entries
            parameters:
                - name: kind
                  in: query
                  schema:
                      type: string
                      enum: [income, expense]
            responses:
                '200':
                    description: Success
                    content:
                        application/json:
                            schema:
                                $ref: '#/components/schemas/EntriesResponse'
```

This API design provides a clean, consistent interface for the MVP while being structured to easily accommodate future features like authentication, payments, and AI parsing.
