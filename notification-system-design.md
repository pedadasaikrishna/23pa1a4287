# Notification System API Design

## Stage 1

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

# Stage 2

## Database Selection

For the notification platform, **MongoDB** is the preferred database for storing notification data.

### Why Choose MongoDB?

MongoDB is well suited for applications that handle a high volume of notification records because it offers:

* A document-based storage model using BSON (JSON-like documents).
* Fast write operations, making it suitable for systems that generate notifications frequently.
* Horizontal scaling through sharding to support future growth.
* A flexible schema, allowing additional fields to be introduced without modifying existing documents.
* Seamless integration with Node.js applications through the Mongoose ODM.

---

# Database Collections

## students

```json id="t7q2am"
{
  "_id": ObjectId,
  "name": "PEDADA SAI KRISHNA",
  "email": "23pa1a4287@vishnu.edu.in",
  "createdAt": ISODate("2026-04-22T17:51:18Z")
}
```

---

## notifications

```
{
  "_id": ObjectId,
  "studentId": ObjectId,
  "type": "Placement",
  "title": "Placement Drive",
  "message": "Microsoft is hiring",
  "isRead": false,
  "createdAt": ISODate("2026-04-22T17:51:18Z")
}
```

---

# Data Relationship

Each student can have multiple notifications associated with their account.

```
Student
   │
   ├── Notification
   ├── Notification
   └── Notification
```

The connection between the two collections is established using the `studentId` field stored in every notification document.

---

# Index Strategy

To improve query performance, the following indexes should be created.

```javascript id="zgc4lj"
db.notifications.createIndex({ studentId: 1 })

db.notifications.createIndex({ studentId: 1, isRead: 1 })

db.notifications.createIndex({ type: 1 })

db.notifications.createIndex({ createdAt: -1 })
```

These indexes help reduce query execution time by allowing MongoDB to locate matching documents without scanning the entire collection.

---

# Challenges with Large Datasets

As the notification database expands, several performance issues may appear:

* Queries become slower when appropriate indexes are unavailable.
* Loading a large number of notifications increases memory consumption.
* Sorting records by creation time requires additional processing.
* Query latency grows as the collection size increases.

---

# Performance Improvements

The following techniques help maintain good performance as the application scales:

* Create indexes on fields that are frequently searched or filtered.
* Implement pagination using `skip()` and `limit()` to avoid loading excessive data.
* Return only the required fields through projections.
* Move historical notifications to an archive collection.
* Distribute data across multiple shards when notification volume becomes very large.
* Cache frequently requested notifications using Redis to reduce database load.

---

# MongoDB Operations

## Retrieve Notifications

```javascript id="jwxlqe"
db.notifications
.find({ studentId: ObjectId(studentId) })
.sort({ createdAt: -1 })
.skip(0)
.limit(10)
```

This query returns a paginated list of notifications for a specific student, ordered from the newest to the oldest.

---

## Retrieve a Single Notification

```javascript id="f8zjj2"
db.notifications.findOne({
    _id: ObjectId(notificationId)
})
```

This operation retrieves a notification using its unique identifier.

---

## Insert a New Notification

```javascript id="v87go3"
db.notifications.insertOne({
    studentId: ObjectId(studentId),
    type: "Placement",
    title: "Placement Drive",
    message: "Microsoft is hiring",
    isRead: false,
    createdAt: new Date()
})
```

A new notification document is added to the collection with the current timestamp.

---

## Mark One Notification as Read

```javascript
db.notifications.updateOne(
    {
        _id: ObjectId(notificationId)
    },
    {
        $set: {
            isRead: true
        }
    }
)
```

This updates the read status of a single notification.

---

## Mark All Notifications as Read

```javascript 
db.notifications.updateMany(
    {
        studentId: ObjectId(studentId)
    },
    {
        $set: {
            isRead: true
        }
    }
)
```

Every notification associated with the specified student is updated to indicate that it has been read.

---

## Delete a Notification

```javascript 
db.notifications.deleteOne({
    _id: ObjectId(notificationId)
})
```

This removes a notification document from the database based on its identifier.

---
