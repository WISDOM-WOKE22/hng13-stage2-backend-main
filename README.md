# Country Currency & Exchange API

A RESTful API that fetches country data from external APIs, stores it in a MySQL database, and provides CRUD operations with currency exchange rate calculations.

## Features

- Fetch country data from REST Countries API
- Calculate exchange rates using Open Exchange Rates API
- Store and cache data in MySQL database
- CRUD operations for countries
- Filtering and sorting capabilities
- HTML summary generation for statistics
- Comprehensive error handling

## Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hng-stage2-backend
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Set up environment variables (optional):
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./data/countries.db"
PORT=3000
```

4. Set up the database:
```bash
# Generate Prisma client
npx prisma generate

# Create the database and run migrations
npx prisma db push
```

## Running the Application

### Development
```bash
pnpm run start:dev
# or
npm run start:dev
```

### Production
```bash
pnpm run build
pnpm run start:prod
# or
npm run build
npm run start:prod
```

## API Endpoints

### Countries

#### POST /countries/refresh
Fetches all countries and exchange rates, then caches them in the database.

**Response:**
```json
{
  "message": "Countries refreshed successfully",
  "countries_processed": 250
}
```

#### GET /countries
Get all countries from the database with optional filtering and sorting.

**Query Parameters:**
- `region` (optional): Filter by region (e.g., "Africa")
- `currency` (optional): Filter by currency code (e.g., "NGN")
- `sort` (optional): Sort by field and direction
  - `gdp_asc`, `gdp_desc`
  - `population_asc`, `population_desc`
  - `name_asc`, `name_desc`

**Example:**
```
GET /countries?region=Africa&sort=gdp_desc
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139589,
    "currency_code": "NGN",
    "exchange_rate": 1600.23,
    "estimated_gdp": 25767448125.2,
    "flag_url": "https://flagcdn.com/ng.svg",
    "last_refreshed_at": "2025-10-22T18:00:00Z"
  }
]
```

#### GET /countries/:name
Get a specific country by name.

**Response:**
```json
{
  "id": 1,
  "name": "Nigeria",
  "capital": "Abuja",
  "region": "Africa",
  "population": 206139589,
  "currency_code": "NGN",
  "exchange_rate": 1600.23,
  "estimated_gdp": 25767448125.2,
  "flag_url": "https://flagcdn.com/ng.svg",
  "last_refreshed_at": "2025-10-22T18:00:00Z"
}
```

#### DELETE /countries/:name
Delete a country record.

**Response:**
```json
{
  "message": "Country deleted successfully"
}
```

#### GET /countries/image
Serve the generated summary HTML page.

**Response:** HTML page with countries summary

### Status

#### GET /status
Get total countries count and last refresh timestamp.

**Response:**
```json
{
  "total_countries": 250,
  "last_refreshed_at": "2025-10-22T18:00:00Z"
}
```

## Error Handling

The API returns consistent JSON error responses:

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": {
    "currency_code": "is required"
  }
}
```

### 404 Not Found
```json
{
  "error": "Country not found"
}
```

### 503 Service Unavailable
```json
{
  "error": "External data source unavailable",
  "details": "Could not fetch data from restcountries.com"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Database Schema

The `Country` model includes the following fields:

- `id`: Auto-generated primary key
- `name`: Country name (required, unique)
- `capital`: Capital city (optional)
- `region`: Geographic region (optional)
- `population`: Population count (required)
- `currency_code`: Currency code (optional)
- `exchange_rate`: Exchange rate to USD (optional)
- `estimated_gdp`: Calculated GDP estimate (optional)
- `flag_url`: URL to country flag image (optional)
- `last_refreshed_at`: Timestamp of last update

## External APIs

- **Countries Data**: https://restcountries.com/v2/all
- **Exchange Rates**: https://open.er-api.com/v6/latest/USD

## Currency Handling Logic

1. If a country has multiple currencies, only the first one is stored
2. If no currencies are available:
   - `currency_code` is set to `null`
   - `exchange_rate` is set to `null`
   - `estimated_gdp` is set to `0`
3. If currency code is not found in exchange rates:
   - `exchange_rate` is set to `null`
   - `estimated_gdp` is set to `null`

## GDP Calculation

The estimated GDP is calculated using the formula:
```
estimated_gdp = (population × random(1000–2000)) ÷ exchange_rate
```

Where `random(1000–2000)` generates a fresh random multiplier for each refresh.

## Testing

Run the test suite:
```bash
pnpm run test
# or
npm test
```

Run e2e tests:
```bash
pnpm run test:e2e
# or
npm run test:e2e
```

## Deployment

The application can be deployed to various platforms:

- Railway
- Heroku
- AWS
- DigitalOcean
- Any platform supporting Node.js

With SQLite, no external database setup is required! The database file will be created automatically.

For production, you may want to set a custom `DATABASE_URL`:
```env
DATABASE_URL="file:./data/countries.db"
```

## License

This project is licensed under the MIT License.