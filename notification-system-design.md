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

# Stage 3

## Query Evaluation

### Existing Query

```sql
SELECT *
FROM notifications
WHERE student_id = 1042
AND is_read = FALSE
ORDER BY created_at ASC;
```

### Is the Query Correct?

From a functional perspective, the query is valid. It retrieves every unread notification associated with the student whose ID is **1042** and arranges the results in ascending order based on their creation timestamp.

Although the logic is correct, the query may not perform efficiently once the notification table reaches millions of records.

---

# Factors Affecting Performance

## 1. Retrieving All Columns

The use of `SELECT *` instructs the database to return every column in each matching row.

In many applications, only a limited set of fields—such as the notification title, message, category, and creation time—are displayed to the user. Returning unnecessary columns increases disk I/O, network traffic, and memory consumption.

---

## 2. Absence of Proper Indexes

When the filtering columns are not indexed, the database engine must examine every row in the table before identifying the matching notifications.

With millions of stored notifications, this sequential scan significantly increases query execution time.

---

## 3. Sorting Overhead

After filtering the records, the database orders the results using the `created_at` column.

If the sorting column is not included in an index, the database performs an additional sorting step, which further impacts performance, especially for large result sets.

---

# Improved Query

Instead of requesting every attribute from the table, it is more efficient to retrieve only the information required by the application.

```sql
SELECT
    id,
    title,
    message,
    type,
    created_at
FROM notifications
WHERE student_id = 1042
AND is_read = FALSE
ORDER BY created_at ASC;
```

By reducing the amount of data returned, the database spends less time reading, transmitting, and processing records.

---

# Suggested Index

A composite index that follows the filtering and sorting pattern of the query provides the best improvement.

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications(student_id, is_read, created_at);
```

This index enables the database to:

* Locate notifications belonging to a specific student.
* Filter unread records without scanning the entire table.
* Return the records in chronological order directly from the index.

As a result, both lookup time and sorting overhead are greatly reduced.

---

# Time Complexity

## Without an Index

Without suitable indexing, the database performs a full table scan.

* Searching: **O(n)**
* Sorting: **O(n log n)**

As the notification table continues to grow, response times become increasingly slower.

---

## With the Composite Index

Using the recommended index allows the database to navigate directly to the required records.

* Index Lookup: **O(log n)**
* Fetch Matching Records: proportional to the number of results

Since the index maintains the required ordering, the database usually avoids performing a separate sort operation.

---

# Is Indexing Every Column a Good Strategy?

No.

While indexes accelerate read operations, creating one on every column is generally considered poor database design.

Excessive indexing introduces several disadvantages:

* Additional storage space is required for each index.
* INSERT, UPDATE, and DELETE operations become slower because every index must also be updated.
* The database optimizer may ignore many unused indexes.
* Database maintenance and backup operations become more expensive.

A better strategy is to index only the columns that are commonly used for filtering, joining, sorting, or searching.

---

# SQL Query

Retrieve the IDs of students who received **Placement** notifications within the previous seven days.

```sql
SELECT DISTINCT student_id
FROM notifications
WHERE type = 'Placement'
AND created_at >= NOW() - INTERVAL 7 DAY;
```

---

# Index for the Above Query

To improve the execution of this query, the following composite index is recommended.

```sql
CREATE INDEX idx_notifications_type_created
ON notifications(type, created_at);
```

This index allows the database to efficiently locate notifications of the **Placement** category and restrict the search to recently created records.

---

# Stage 4

## Performance Enhancement Strategy

As the notification platform expands to support more users and a larger volume of notifications, relying solely on the database for every request can increase response time and place unnecessary pressure on the backend. To address these challenges, I would introduce **Redis** as a caching layer and **Socket.IO** to enable instant notification delivery.

---

# Is Caching Necessary?

Yes.

Caching is an effective way to improve application performance by temporarily storing frequently requested data in memory. Instead of repeatedly querying the database, the application can retrieve cached data from Redis, which is significantly faster.

Redis is well suited for this purpose because it is an in-memory key-value store designed to deliver high-speed read and write operations with minimal latency.

---

# Cache Retrieval Process

The notification retrieval process follows these steps:

1. A user requests their notification list.
2. The application checks whether the data exists in Redis.
3. If the requested data is available (**Cache Hit**), Redis immediately returns the notifications.
4. If the data is not found (**Cache Miss**), the application queries the MySQL database.
5. The retrieved notifications are stored in Redis before being sent back to the client.

By serving repeated requests from memory, the system minimizes database access and improves response times.

---

# Maintaining Cache Consistency

Cached data must remain synchronized with the database.

Whenever a notification is created, modified, marked as read, or removed, the corresponding cached data should either be refreshed or deleted.

A common cache invalidation strategy is:

1. Apply the required changes in MySQL.
2. Remove the affected user's cached notifications from Redis.
3. On the next request, retrieve the latest data from MySQL and repopulate the cache.

This approach ensures that users always receive the most recent notification data.

---

# Instant Notification Delivery

To provide real-time updates without requiring users to refresh the application, I would integrate **Socket.IO**, which uses WebSocket communication.

### Workflow

1. The user signs in to the application.
2. The client establishes a persistent Socket.IO connection with the backend.
3. When a new notification is generated, it is first stored in MySQL.
4. Any existing Redis cache for that user is invalidated.
5. The server broadcasts a `new-notification` event through Socket.IO.
6. The connected client receives the notification immediately and updates the user interface in real time.

---

# Advantages of Combining Redis and Socket.IO

Although Redis and Socket.IO are often used together, they serve different purposes within the system architecture.

* Redis reduces the number of database queries by serving frequently requested data from memory.
* Socket.IO maintains a persistent connection between the server and client, allowing notifications to be pushed instantly.

Using both technologies together provides several advantages:

* Lower response latency
* Reduced database workload
* Improved scalability under heavy traffic
* Real-time updates without page refreshes
* Better overall user experience

---

