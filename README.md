# API Proxy - Backend

This is an API proxy server built with NestJS. It provides a search API
endpoint that integrates with DuckDuckGo and stores query history.

## Features

- **Search API:** An endpoint to search using DuckDuckGo.
- **Query History:** Stores search queries and their results.
- **Configuration:** Uses environment variables for configuration.
- **Validation:** Implements Zod validation for request parameters and
  environment variables.
- **Logging:** Custom logger with colored output for different log levels.
- **Error Handling:** Centralized error handling using `ApiError` class.
- **Pagination:** Implements pagination for query history.

## Technologies Used

- [NestJS](https://nestjs.com/): A progressive Node.js framework for
  building efficient, reliable and scalable server-side applications.
- [Zod](https://github.com/colinhacks/zod): TypeScript-first schema
  validation with static type inference.
- [Axios](https://github.com/axios/axios): Promise based HTTP client for the
  browser and node.js.
- [DuckDuckGo API](https://duckduckgo.com/api): For search functionality.
- [pnpm](https://pnpm.io/): Fast, disk space efficient package manager.

## Prerequisites

- Node.js (>= 18)
- pnpm

## Installation

1.  Clone the repository:

    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  Install dependencies:

    ```bash
    pnpm install
    ```

3.  Create a `.env` file in the root directory with the following variables:

    ```env
    PORT=3000
    NODE_ENV=development
    ```

    Adjust the values as needed. `PORT` must be a valid number between 1 and 65535. `NODE_ENV` must be one of `development`, `production`, or `test`.

## Running the Application

```bash
pnpm start
```

This will start the server in development mode. You can also use the following
commands:

- `pnpm run start:dev`: Start the server in development mode with hot-reloading.
- `pnpm run start:debug`: Start the server in debug mode.
- `pnpm run start:prod`: Start the server in production mode.

## API Endpoints

- `GET /api/v1/search?q={query}`: Search for a query using DuckDuckGo.
- `POST /api/v1/search`: Search for a query using DuckDuckGo with the query
  in the request body. The request body should be a JSON object with a
  `query` field:

  ```json
  {
    "query": "your search query"
  }
  ```

- `GET /api/v1/search/history?page={page}&pageSize={pageSize}`: Retrieve the
  query history with pagination. `page` and `pageSize` are optional query
  parameters. If not provided, default values of `page=1` and `pageSize=10`
  are used.

## Query History

The query history is stored in a file named `query-history.jsonl` located in
the `data` directory. Each line in the file is a JSON object representing a
search query and its results.

## Example Usage

### Search API

```bash
curl "http://localhost:3000/api/v1/search?q=nestjs"
```

```bash
curl -X POST -H "Content-Type: application/json" -d '{"query": "nestjs"}' http://localhost:3000/api/v1/search
```

### Query History API

```bash
curl "http://localhost:3000/api/v1/search/history?page=2&pageSize=5"
```

## Error Handling

The API uses the `ApiError` class for centralized error handling. It returns
JSON responses with a status code and a message. Possible errors include:

- **400 Bad Request:** Invalid request parameters.
- **404 Not Found:** Resource not found.
- **500 Internal Server Error:** An unexpected error occurred on the server.

## Logging

The application uses a custom logger (`CustomLogger`) that extends
`ConsoleLogger` from NestJS. It provides colored output for different log
levels and includes timestamps, context, and process ID.
