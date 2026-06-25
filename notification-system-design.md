# Notification System API Design

## Phase 1

### Introduction

This document describes the REST API specification for a campus notification service. The system enables students to receive important updates related to placements, campus events, examination results, and other academic announcements.

The API follows REST architectural principles, uses JSON for data exchange, and relies on standard HTTP methods and status codes. Instant notification delivery is supported through WebSocket communication using Socket.IO.

---

# Notification Resource

```json
{
  "id": "uuid",
  "type": "Placement",
  "title": "Placement Drive",
  "message": "TCS Corporation is hiring.",
  "isRead": false,
  "createdAt": "2026-04-22T17:51:18Z"
}
```

---

# Standard HTTP Headers

### Request Headers

```
Content-Type: application/json
Accept: application/json
```

### Response Headers

```
Content-Type: application/json
```

---

# 1. Retrieve Notifications

**Endpoint**

```
GET /api/notifications
```

### Purpose

Fetches the notification list associated with the authenticated student.

### Query Parameters

| Parameter | Type    | Required | Description                                                 |
| --------- | ------- | -------- | ----------------------------------------------------------- |
| page      | Integer | No       | Page number for pagination                                  |
| limit     | Integer | No       | Maximum records returned per page                           |
| type      | String  | No       | Filter notifications by category (Placement, Event, Result) |

### Sample Request

```
GET /api/notifications?page=1&limit=10&type=Placement
```

### Successful Response (200 OK)

```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "total": 250,
  "notifications": [
    {
      "id": "1",
      "type": "Placement",
      "title": "Placement Drive",
      "message": "Amazon hiring",
      "isRead": false,
      "createdAt": "2026-04-22T17:51:18Z"
    }
  ]
}
```

---

# 2. Retrieve a Notification

**Endpoint**

```
GET /api/notifications/{id}
```

### Example

```
GET /api/notifications/123
```

### Response

```json
{
  "success": true,
  "notification": {
    "id": "123",
    "type": "Result",
    "title": "Semester Result",
    "message": "Results published",
    "isRead": false,
    "createdAt": "2026-04-22T17:51:18Z"
  }
}
```

---

# 3. Create a Notification

**Endpoint**

```
POST /api/notifications
```

### Request Body

```json
{
  "type": "Placement",
  "title": "Placement Drive",
  "message": "Microsoft is hiring."
}
```

### Response (201 Created)

```json
{
  "success": true,
  "message": "Notification created successfully.",
  "notificationId": "12345"
}
```

---

# 4. Update Notification Status

**Endpoint**

```
PATCH /api/notifications/{id}/read
```

### Purpose

Marks a specific notification as read.

### Response

```json
{
  "success": true,
  "message": "Notification status updated successfully."
}
```

---

# 5. Mark Every Notification as Read

**Endpoint**

```
PATCH /api/notifications/read-all
```

### Response

```json
{
  "success": true,
  "message": "All notifications have been marked as read."
}
```

---

# 6. Remove a Notification

**Endpoint**

```
DELETE /api/notifications/{id}
```

### Response

```json
{
  "success": true,
  "message": "Notification removed successfully."
}
```

---

# HTTP Status Codes

| Status Code | Description                           |
| ----------- | ------------------------------------- |
| 200         | Request processed successfully        |
| 201         | Resource created successfully         |
| 400         | Invalid request parameters            |
| 404         | Requested notification does not exist |
| 500         | Unexpected server error               |

---

# Error Format

```json
{
  "success": false,
  "message": "Notification not found."
}
```

---

# Real-Time Notification Delivery

### Communication Protocol

* Socket.IO (WebSocket)

### Notification Flow

1. The student signs in to the application.
2. A WebSocket connection is established with the server.
3. The server maintains the active socket session for the student.
4. An administrator creates a new notification.
5. The notification is stored in the database.
6. The server immediately broadcasts the notification to the intended recipient(s).
7. Connected students receive the notification instantly without refreshing the application.

### Event

```
new-notification
```

### Event Payload

```json
{
  "id": "123",
  "type": "Placement",
  "title": "Placement Drive",
  "message": "Amazon hiring",
  "createdAt": "2026-04-22T17:51:18Z"
}
```

---

# API Reference

| HTTP Method | Endpoint                     | Purpose                          |
| ----------- | ---------------------------- | -------------------------------- |
| GET         | /api/notifications           | Retrieve all notifications       |
| GET         | /api/notifications/{id}      | Retrieve a specific notification |
| POST        | /api/notifications           | Publish a new notification       |
| PATCH       | /api/notifications/{id}/read | Mark a notification as read      |
| PATCH       | /api/notifications/read-all  | Mark every notification as read  |
| DELETE      | /api/notifications/{id}      | Delete a notification            |

---

# API Design Standards

* Resource paths use plural nouns for consistency.
* HTTP methods are selected according to REST conventions.
* All request and response payloads are exchanged in JSON format.
* Each notification is uniquely identified using a UUID.
* Date and time values follow the ISO 8601 standard.
* API responses maintain a consistent structure to simplify client-side integration.
