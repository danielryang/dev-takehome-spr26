# Checklist

<!-- Make sure you fill out this checklist with what you've done before submitting! -->

- [x] Read the README [please please please]
- [x] Something cool!
- [x] Back-end
  - [x] Minimum Requirements
    - [x] Setup MongoDB database
    - [x] Setup item requests collection
    - [x] `PUT /api/request`
    - [x] `GET /api/request?page=_`
  - [x] Main Requirements
    - [x] `GET /api/request?status=pending`
    - [x] `PATCH /api/request`
  - [x] Above and Beyond
    - [x] Batch edits
    - [x] Batch deletes
- [x] Front-end
  - [x] Minimum Requirements
    - [x] Dropdown component
    - [x] Table component
    - [x] Base page [table with data]
    - [x] Table dropdown interactivity
  - [x] Main Requirements
    - [x] Pagination
    - [x] Tabs
  - [x] Above and Beyond
    - [x] Batch edits
    - [x] Batch deletes

# Notes

<!-- Notes go here -->

## Implementation Summary

### Backend

#### Minimum Requirements
- **MongoDB Setup**: Created a MongoDB database with a `requests` collection using Mongoose schema validation (`src/server/models/request.model.ts`)
- **PUT /api/request**: Implemented endpoint to create new requests with auto-generated fields (creation date, status = "pending")
- **GET /api/request?page=_**: Implemented paginated retrieval with descending date sort using MongoDB skip/limit

#### Main Requirements
- **GET /api/request?status=pending**: Added status filtering in the GET endpoint with server-side database filtering using MongoDB queries
- **PATCH /api/request**: Implemented single update endpoint that modifies request status and updates lastEditedDate

#### Above and Beyond
- **Batch Edits**: Extended PATCH endpoint to support both single and batch updates via `updates` array parameter. Returns successful updates and failed IDs separately for partial success handling
- **Batch Deletes**: Created DELETE endpoint that accepts an `ids` array and returns deletion count plus any failed IDs. Both batch operations validate all inputs before processing and handle errors gracefully

**Architecture**: Implemented a three-layer architecture separating concerns:
1. **Validation layer** (`/lib/validation/requests.ts`) - Input validation with TypeScript interfaces
2. **Business logic layer** (`/server/requests.ts`) - Database operations and data transformations
3. **Database model layer** (`/server/models/request.model.ts`) - Mongoose schema with validation

### Frontend

#### Minimum Requirements
- **Dropdown Component**: Built reusable Dropdown component in `src/components/atoms/Dropdown.tsx` with controlled value and onChange props. Also created StatusDropdown component for displaying status badges in dropdown options
- **Table Component**: Created RequestsTable component in `src/components/tables/RequestsTable.tsx` with columns for checkbox selection, Name, Item Requested, Created, Updated, and Status. Includes date formatting, empty state handling, and custom checkbox styling with light blue selection highlighting
- **Base Page with API Integration**: Implemented `/admin` page that fetches data from `GET /api/request` on mount using React hooks. Displays loading state during fetch and error messages on failure
- **Dropdown Interactivity**: StatusDropdown at top of table allows batch status updates via `PATCH /api/request` API calls. Individual statuses displayed as read-only color-coded badges in the table. Updates are reflected in UI with proper error handling

#### Main Requirements
- **Tabs**: Added status filter tabs (All, Pending, Approved, Completed, Rejected) with visual styling. Selected tab filters displayed requests. Tabs styled as rounded rectangular blocks with active state showing blue background and white text
- **Pagination**: Implemented full pagination with Pagination component from `src/components/molecules/Pagination.tsx`. Shows page count and navigation arrows. Automatically resets to page 1 when changing tabs or adding new requests. Backend returns total count for accurate pagination display

#### Above and Beyond
- **Batch Edit**: Added checkbox column for selecting multiple requests. StatusDropdown labeled "Mark as" at top right of table updates all selected requests immediately when a new status is chosen via batch PATCH API. Updates are reflected in UI with proper error handling and list refresh
- **Batch Delete**: Trash icon button deletes all selected requests via batch DELETE API without confirmation. Shows error alert on failure and refreshes list. Selection cleared after operations and when changing pages/tabs

## Documentation

### Setup
- Set `MONGODB_URI=mongodb://localhost:27017/bfg` in `.env`

### API Endpoints

**PUT /api/request** - Create new request
```bash
curl -X PUT http://localhost:3000/api/request \
  -H "Content-Type: application/json" \
  -d '{"requestorName":"Jane Doe","itemRequested":"Flashlights"}'
```

**GET /api/request?page=_** - Get paginated requests
```bash
curl http://localhost:3000/api/request?page=1
```

**GET /api/request?status=pending** - Get paginated requests filtered by status
```bash
curl http://localhost:3000/api/request?status=pending&page=1
```

**PATCH /api/request** - Update single request status
```bash
curl -X PATCH http://localhost:3000/api/request \
  -H "Content-Type: application/json" \
  -d '{"id":"507f1f77bcf86cd799439011","status":"approved"}'
```

**PATCH /api/request (Batch)** - Update multiple request statuses
```bash
curl -X PATCH http://localhost:3000/api/request \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {"id":"507f1f77bcf86cd799439011","status":"approved"},
      {"id":"507f191e810c19729de860ea","status":"rejected"}
    ]
  }'
```

Response format:
```json
{
  "updated": [
    {
      "id": "507f1f77bcf86cd799439011",
      "requestorName": "Jane Doe",
      "itemRequested": "Flashlights",
      "requestCreatedDate": "2024-01-15T10:30:00.000Z",
      "lastEditedDate": "2024-01-15T12:00:00.000Z",
      "status": "approved"
    }
  ],
  "failed": ["507f191e810c19729de860ea"]
}
```

**DELETE /api/request** - Delete multiple requests
```bash
curl -X DELETE http://localhost:3000/api/request \
  -H "Content-Type: application/json" \
  -d '{
    "ids": [
      "507f1f77bcf86cd799439011",
      "507f191e810c19729de860ea",
      "507f191e810c19729de860eb"
    ]
  }'
```

Response format:
```json
{
  "deletedCount": 2,
  "failed": ["507f191e810c19729de860eb"]
}
```

### Batch Operations Details

#### Batch Edit
- **Endpoint:** `PATCH /api/request`
- **Body:** `{ updates: [{ id: string, status: string }, ...] }`
- **Behavior:** Updates multiple requests in one call. Returns both successful updates and failed IDs.
- **Validation:** Each update is validated individually. If validation fails for any update, the entire batch is rejected.
- **Response:** Contains `updated` array with full request objects and `failed` array with IDs that couldn't be found/updated.

#### Batch Delete
- **Endpoint:** `DELETE /api/request`
- **Body:** `{ ids: [string, ...] }`
- **Behavior:** Deletes multiple requests in one call. Returns count of deletions and failed IDs.
- **Validation:** All IDs must be non-empty strings. If validation fails, the entire batch is rejected.
- **Response:** Contains `deletedCount` (number) and `failed` array with IDs that couldn't be found/deleted.

### Key Files

#### Backend
- `src/app/api/request/route.ts` - API route handlers (GET, PUT, PATCH, DELETE)
- `src/server/models/request.model.ts` - MongoDB Mongoose schema
- `src/server/requests.ts` - Database operations and business logic
- `src/lib/db/mongodb.ts` - MongoDB connection setup
- `src/lib/validation/requests.ts` - Input validation functions

#### Frontend
- `src/app/admin/page.tsx` - Main admin page with form, tabs, table, and pagination
- `src/app/cool/page.tsx` - Personal portfolio page
- `src/components/tables/RequestsTable.tsx` - Reusable table component with selection
- `src/components/molecules/Pagination.tsx` - Reusable pagination component
- `src/components/atoms/Dropdown.tsx` - Reusable dropdown component
- `src/components/atoms/StatusDropdown.tsx` - Status dropdown with badge options
- `src/components/atoms/StatusBadge.tsx` - Color-coded status badge component
- `src/components/atoms/Button.tsx` - Reusable button component
- `src/components/atoms/Input.tsx` - Reusable input component
- `src/components/icons/TrashIcon.tsx` - Trash can icon for delete operations
