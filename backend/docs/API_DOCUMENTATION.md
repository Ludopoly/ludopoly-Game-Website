# 📡 Ludopoly Game Chat System - API Documentation

## 🔗 Base URL
```
Production: https://api.ludopoly.com/v1
Development: http://localhost:3000/api/v1
WebSocket: ws://localhost:3000 (Development)
WebSocket: wss://api.ludopoly.com (Production)
```

## 🔐 Authentication

### Overview
The API uses JWT (JSON Web Tokens) for authentication. All protected endpoints require a valid JWT token in the Authorization header.

### Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Token Structure
```typescript
interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  walletAddress?: string;
  iat: number;
  exp: number;
}
```

## 🏷️ REST API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "username": "string (3-50 chars)",
  "email": "string (valid email)",
  "password": "string (min 8 chars)",
  "walletAddress": "string (optional, 42 chars)"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "walletAddress": "string",
      "createdAt": "timestamp"
    },
    "tokens": {
      "accessToken": "jwt_string",
      "refreshToken": "jwt_string",
      "expiresIn": 86400
    }
  }
}
```

**Error Responses:**
```json
// 400 Bad Request
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": ["Username already exists"]
  }
}

// 409 Conflict
{
  "success": false,
  "error": {
    "code": "USER_EXISTS",
    "message": "User with this email already exists"
  }
}
```

#### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "walletAddress": "string"
    },
    "tokens": {
      "accessToken": "jwt_string",
      "refreshToken": "jwt_string",
      "expiresIn": 86400
    }
  }
}
```

#### Refresh Token
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "jwt_string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_string",
    "expiresIn": 86400
  }
}
```

#### Logout
```http
POST /auth/logout
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

### Room Management Endpoints

#### Get All Rooms
```http
GET /rooms
```

**Query Parameters:**
```
type: string (optional) - 'game', 'regional', 'global'
page: number (default: 1)
limit: number (default: 20, max: 100)
active: boolean (default: true)
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "id": "uuid",
        "name": "string",
        "type": "game|regional|global",
        "isRateLimited": false,
        "maxParticipants": 100,
        "currentParticipants": 25,
        "isActive": true,
        "createdAt": "timestamp"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

#### Get Room Details
```http
GET /rooms/:roomId
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "room": {
      "id": "uuid",
      "name": "string",
      "type": "game",
      "blockchainEventId": "string",
      "isRateLimited": true,
      "rateLimitConfig": {
        "activePeriod": 60,
        "cooldownPeriod": 300,
        "currentPhase": "active",
        "phaseEndTime": "timestamp"
      },
      "maxParticipants": 100,
      "participants": [
        {
          "id": "uuid",
          "username": "string",
          "role": "admin|moderator|member",
          "joinedAt": "timestamp"
        }
      ],
      "createdAt": "timestamp"
    }
  }
}
```

#### Create Room
```http
POST /rooms
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "string (max 100 chars)",
  "type": "game|regional|global",
  "maxParticipants": 100,
  "blockchainEventId": "string (optional)"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "room": {
      "id": "uuid",
      "name": "string",
      "type": "game",
      "isRateLimited": false,
      "maxParticipants": 100,
      "isActive": true,
      "createdAt": "timestamp"
    }
  }
}
```

#### Join Room
```http
POST /rooms/:roomId/join
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Successfully joined room",
    "participant": {
      "userId": "uuid",
      "roomId": "uuid",
      "role": "member",
      "joinedAt": "timestamp"
    }
  }
}
```

#### Leave Room
```http
POST /rooms/:roomId/leave
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully left room"
}
```

### Message Endpoints

#### Get Room Messages
```http
GET /rooms/:roomId/messages
```

**Query Parameters:**
```
page: number (default: 1)
limit: number (default: 15, max: 50)
before: timestamp (optional, for pagination)
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "content": "decrypted_message_content",
        "messageType": "text|system|emoji",
        "user": {
          "id": "uuid",
          "username": "string"
        },
        "createdAt": "timestamp",
        "isDeleted": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 15,
      "hasMore": true
    }
  }
}
```

#### Send Message
```http
POST /rooms/:roomId/messages
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "string (max 1000 chars)",
  "messageType": "text|emoji"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "uuid",
      "content": "string",
      "messageType": "text",
      "roomId": "uuid",
      "userId": "uuid",
      "createdAt": "timestamp"
    }
  }
}
```

**Error Responses:**
```json
// 429 Rate Limited
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded",
    "retryAfter": 180,
    "details": {
      "currentPhase": "cooldown",
      "phaseEndTime": "timestamp"
    }
  }
}
```

#### Delete Message
```http
DELETE /messages/:messageId
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

### User Profile Endpoints

#### Get User Profile
```http
GET /users/profile
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "walletAddress": "string",
      "isActive": true,
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  }
}
```

#### Update User Profile
```http
PUT /users/profile
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "username": "string (optional)",
  "walletAddress": "string (optional)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "walletAddress": "string",
      "updatedAt": "timestamp"
    }
  }
}
```

## 🔌 WebSocket API

### Connection Setup

#### Authentication
```javascript
import io from 'socket.io-client';

const socket = io('ws://localhost:3000', {
  auth: {
    token: 'your_jwt_token'
  },
  transports: ['websocket']
});
```

#### Connection Events
```javascript
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.log('Connection error:', error.message);
});
```

### Client to Server Events

#### Join Room
```javascript
socket.emit('join-room', {
  roomId: 'uuid'
});
```

**Server Response:**
```javascript
socket.on('room-joined', (data) => {
  console.log(data);
  // {
  //   roomId: 'uuid',
  //   participants: [...],
  //   recentMessages: [...],
  //   rateLimitConfig: {...}
  // }
});
```

#### Send Message
```javascript
socket.emit('send-message', {
  roomId: 'uuid',
  content: 'Hello everyone!',
  messageType: 'text'
});
```

**Server Response:**
```javascript
socket.on('message-sent', (data) => {
  // { messageId: 'uuid', timestamp: '...' }
});
```

#### Leave Room
```javascript
socket.emit('leave-room', {
  roomId: 'uuid'
});
```

#### Typing Indicator
```javascript
// Start typing
socket.emit('typing-start', {
  roomId: 'uuid'
});

// Stop typing
socket.emit('typing-stop', {
  roomId: 'uuid'
});
```

### Server to Client Events

#### Message Received
```javascript
socket.on('message-received', (message) => {
  console.log(message);
  // {
  //   id: 'uuid',
  //   content: 'decrypted_content',
  //   messageType: 'text',
  //   user: { id: 'uuid', username: 'string' },
  //   roomId: 'uuid',
  //   createdAt: 'timestamp'
  // }
});
```

#### User Joined Room
```javascript
socket.on('user-joined', (data) => {
  // {
  //   user: { id: 'uuid', username: 'string' },
  //   roomId: 'uuid',
  //   timestamp: 'timestamp'
  // }
});
```

#### User Left Room
```javascript
socket.on('user-left', (data) => {
  // {
  //   user: { id: 'uuid', username: 'string' },
  //   roomId: 'uuid',
  //   timestamp: 'timestamp'
  // }
});
```

#### Rate Limit Changed
```javascript
socket.on('rate-limit-changed', (config) => {
  // {
  //   roomId: 'uuid',
  //   isEnabled: true,
  //   currentPhase: 'active|cooldown',
  //   phaseEndTime: 'timestamp',
  //   activePeriod: 60,
  //   cooldownPeriod: 300
  // }
});
```

#### Room Created (Blockchain Event)
```javascript
socket.on('room-created', (room) => {
  // {
  //   id: 'uuid',
  //   name: 'string',
  //   type: 'game',
  //   blockchainEventId: 'string',
  //   createdAt: 'timestamp'
  // }
});
```

#### Typing Indicators
```javascript
socket.on('user-typing', (data) => {
  // {
  //   user: { id: 'uuid', username: 'string' },
  //   roomId: 'uuid'
  // }
});

socket.on('user-stopped-typing', (data) => {
  // {
  //   user: { id: 'uuid', username: 'string' },
  //   roomId: 'uuid'
  // }
});
```

#### Rate Limited
```javascript
socket.on('rate-limited', (data) => {
  // {
  //   roomId: 'uuid',
  //   waitTime: 180, // seconds until next active phase
  //   currentPhase: 'cooldown',
  //   message: 'Rate limit exceeded. Please wait.'
  // }
});
```

#### Error Events
```javascript
socket.on('error', (error) => {
  // {
  //   code: 'UNAUTHORIZED|ROOM_NOT_FOUND|RATE_LIMITED',
  //   message: 'Error description',
  //   details: {...}
  // }
});
```

### Room Namespaces

#### Global Events
```javascript
// Listen to global announcements
socket.on('global-announcement', (data) => {
  // {
  //   message: 'string',
  //   type: 'maintenance|update|alert',
  //   timestamp: 'timestamp'
  // }
});
```

#### Blockchain Events
```javascript
// New world creation event
socket.on('blockchain:world-created', (data) => {
  // {
  //   roomId: 'uuid',
  //   gameId: 'string',
  //   transactionHash: 'string',
  //   blockNumber: number,
  //   timestamp: 'timestamp'
  // }
});
```

## 📊 Error Codes Reference

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

### Custom Error Codes
```typescript
enum ErrorCodes {
  // Authentication
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Rate Limiting
  RATE_LIMITED = 'RATE_LIMITED',
  COOLDOWN_ACTIVE = 'COOLDOWN_ACTIVE',
  
  // Room Management
  ROOM_NOT_FOUND = 'ROOM_NOT_FOUND',
  ROOM_FULL = 'ROOM_FULL',
  ALREADY_IN_ROOM = 'ALREADY_IN_ROOM',
  NOT_IN_ROOM = 'NOT_IN_ROOM',
  
  // Messages
  MESSAGE_TOO_LONG = 'MESSAGE_TOO_LONG',
  MESSAGE_NOT_FOUND = 'MESSAGE_NOT_FOUND',
  CANNOT_DELETE_MESSAGE = 'CANNOT_DELETE_MESSAGE',
  
  // Blockchain
  BLOCKCHAIN_CONNECTION_ERROR = 'BLOCKCHAIN_CONNECTION_ERROR',
  INVALID_BLOCKCHAIN_EVENT = 'INVALID_BLOCKCHAIN_EVENT',
  
  // General
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}
```

## 🔄 Rate Limiting Details

### Rate Limit Headers
All API responses include rate limiting information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Rate Limiting Rules

#### General API Endpoints
- `100 requests per minute` per user for most endpoints
- `10 requests per minute` for authentication endpoints
- `300 requests per minute` for message retrieval

#### WebSocket Events
- `60 messages per minute` per user (when rate limiting is disabled)
- Dynamic rate limiting based on room configuration when enabled
- `10 room join/leave actions per minute` per user

## 📋 SDK Examples

### JavaScript/TypeScript
```typescript
import LudopolyChatSDK from '@ludopoly/chat-sdk';

const chatClient = new LudopolyChatSDK({
  apiUrl: 'https://api.ludopoly.com/v1',
  wsUrl: 'wss://api.ludopoly.com',
  accessToken: 'your_jwt_token'
});

// Join a room and listen for messages
await chatClient.joinRoom('room-uuid');
chatClient.onMessage((message) => {
  console.log('New message:', message);
});

// Send a message
await chatClient.sendMessage('room-uuid', 'Hello world!');
```

### Python
```python
import ludopoly_chat

client = ludopoly_chat.Client(
    api_url='https://api.ludopoly.com/v1',
    access_token='your_jwt_token'
)

# Get room messages
messages = client.get_messages('room-uuid', limit=20)

# Send message via HTTP
response = client.send_message('room-uuid', 'Hello from Python!')
```

## 🧪 Testing Endpoints

### Health Check
```http
GET /health
```

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-18T10:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "blockchain": "healthy"
  }
}
```

### API Version
```http
GET /version
```

**Response (200):**
```json
{
  "version": "1.0.0",
  "buildDate": "2025-09-18T10:00:00Z",
  "commit": "abc123def456"
}
```

---

*For more detailed examples and advanced usage, please refer to the [SDK Documentation](./SDK_DOCUMENTATION.md) and [Integration Guide](./INTEGRATION_GUIDE.md).*
