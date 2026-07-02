# Veriscope OS — API Specifications

This document defines the REST API endpoints, request schemas, and sample response objects of the Veriscope OS backend.

---

## 1. System Health Status

### `GET /health`
* **Purpose**: Root server health check and metadata.
* **Response**:
```json
{
  "status": "healthy",
  "application": "Veriscope OS",
  "version": "1.2.0",
  "timestamp": "2026-07-02T11:30:00.000Z"
}
```

---

## 2. Research Operations

### `POST /api/research`
* **Purpose**: Triggers a new research session for a given company ticker.
* **Request Body**:
```json
{
  "ticker": "AAPL"
}
```
* **Response (Started)**:
```json
{
  "id": "session_1720000000000",
  "ticker": "AAPL"
}
```

### `GET /api/history`
* **Purpose**: Retrieves list of previous research sessions.
* **Response**:
```json
[
  {
    "id": "session_1720000000000",
    "ticker": "AAPL",
    "companyName": "Apple Inc.",
    "recommendation": "Buy",
    "confidence": 85,
    "status": "completed",
    "pinned": false,
    "createdAt": "2026-07-02T11:30:00.000Z"
  }
]
```

### `GET /api/history/:id`
* **Purpose**: Retrieves the full detailed evidence graph and analysis report for a specific session ID.
* **Response**:
```json
{
  "id": "session_1720000000000",
  "ticker": "AAPL",
  "pinned": false,
  "createdAt": "2026-07-02T11:30:00.000Z",
  "state": {
    "status": "completed",
    "ticker": "AAPL",
    "companyIntel": {
      "name": "Apple Inc.",
      "ticker": "AAPL",
      "summary": "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide..."
    },
    "financials": {
      "metrics": {
        "revenue": 385700000000,
        "netIncome": 100910000000
      },
      "formattedMetrics": {}
    },
    "risks": {
      "risks": [],
      "overallScore": 32
    },
    "decision": {
      "recommendation": "Buy",
      "confidence": 85,
      "reasoning": [],
      "futureOutlook": "Steady expansion expected..."
    }
  }
}
```

### `POST /api/history/:id/pin`
* **Purpose**: Toggles the pinned bookmark status of a report.
* **Response**:
```json
{
  "success": true,
  "pinned": true
}
```

### `DELETE /api/history/:id`
* **Purpose**: Deletes a research report permanently.
* **Response**:
```json
{
  "success": true
}
```
