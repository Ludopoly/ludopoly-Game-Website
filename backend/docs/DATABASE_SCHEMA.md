# 🗄️ Ludopoly Chat System - Database Schema Documentation

## 📋 Overview

The Ludopoly Chat System uses MongoDB as the primary database with Redis for caching and session management. The database schema is designed with flexible document structures optimized for chat message storage and retrieval patterns.

## 🏗️ Database Architecture

### Primary Database: MongoDB 6.0+
- **Document-Based**: Flexible schema for evolving message types
- **High Performance**: Optimized for read-heavy chat operations  
- **Horizontal Scaling**: Built-in sharding support for large datasets
- **JSON Native**: Direct compatibility with JavaScript/TypeScript
- **Rich Queries**: Advanced aggregation pipeline for analytics

### Caching Layer: Redis 6+
- **Session Storage**: JWT refresh tokens and user sessions
- **Rate Limiting**: Per-user and per-room rate limit counters
- **Real-time Data**: Active room participants and typing indicators
- **Message Cache**: Recent messages for quick retrieval

## 📊 Document Structure Overview

```
ludopoly_chat (Database)
├── users (Collection)
│   ├── _id: ObjectId
│   ├── username: String
│   ├── email: String  
│   ├── passwordHash: String
│   ├── walletAddress: String (optional)
│   ├── isActive: Boolean
│   ├── createdAt: Date
│   └── updatedAt: Date
│
├── chatRooms (Collection)
│   ├── _id: ObjectId
│   ├── name: String
│   ├── type: String (enum: 'game', 'regional', 'global')
│   ├── blockchainEventId: String (optional)
│   ├── isRateLimited: Boolean
│   ├── rateLimitConfig: Object
│   ├── maxParticipants: Number
│   ├── participants: Array[ObjectId] (references users)
│   ├── isActive: Boolean
│   ├── createdAt: Date
│   └── updatedAt: Date
│
├── messages (Collection)
│   ├── _id: ObjectId
│   ├── roomId: ObjectId (reference to chatRooms)
│   ├── userId: ObjectId (reference to users)
│   ├── content: String
│   ├── encryptedContent: String (optional)
│   ├── messageType: String (enum: 'text', 'system', 'emoji', 'file')
│   ├── replyToId: ObjectId (optional, reference to messages)
│   ├── isDeleted: Boolean
│   ├── createdAt: Date
│   └── updatedAt: Date
│
└── roomParticipants (Collection)
    ├── _id: ObjectId
    ├── roomId: ObjectId (reference to chatRooms)
    ├── userId: ObjectId (reference to users)
    ├── role: String (enum: 'admin', 'moderator', 'member')
    ├── joinedAt: Date
    ├── isMuted: Boolean
    ├── mutedUntil: Date (optional)
    └── lastSeenAt: Date
```

## 📋 Collection Specifications

### Users Collection

```javascript
// MongoDB Schema Definition
{
  _id: ObjectId,
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 3,
    maxLength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  passwordHash: {
    type: String,
    required: true
  },
  walletAddress: {
    type: String,
    unique: true,
    sparse: true, // Allows null values
    match: /^0x[a-fA-F0-9]{40}$/
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}

// Indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ username: 1 }, { unique: true })
db.users.createIndex({ walletAddress: 1 }, { unique: true, sparse: true })
db.users.createIndex({ isActive: 1 })
```

**Field Descriptions:**
- `_id`: Auto-generated unique identifier
- `username`: Display name (3-50 characters, unique)
- `email`: User's email address (unique, validated format)
- `passwordHash`: bcrypt hashed password
- `walletAddress`: Ethereum wallet address (optional, 42 characters)
- `isActive`: Account status flag
- `createdAt`/`updatedAt`: Timestamp tracking

### Chat Rooms Collection

```javascript
// MongoDB Schema Definition
{
  _id: ObjectId,
  name: {
    type: String,
    required: true,
    maxLength: 100
  },
  type: {
    type: String,
    required: true,
    enum: ['game', 'regional', 'global']
  },
  blockchainEventId: {
    type: String,
    sparse: true
  },
  isRateLimited: {
    type: Boolean,
    default: false
  },
  rateLimitConfig: {
    activePeriod: { type: Number, default: 60 },
    cooldownPeriod: { type: Number, default: 300 },
    isEnabled: { type: Boolean, default: false },
    currentPhase: { 
      type: String, 
      enum: ['unlimited', 'active', 'cooldown'],
      default: 'unlimited'
    },
    phaseStartTime: { type: Date, default: Date.now },
    lastStateChange: { type: Date, default: Date.now }
  },
  maxParticipants: {
    type: Number,
    default: 100,
    min: 1,
    max: 1000
  },
  participants: [{
    type: ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}

// Indexes
db.chatRooms.createIndex({ type: 1 })
db.chatRooms.createIndex({ isActive: 1 })
db.chatRooms.createIndex({ blockchainEventId: 1 }, { sparse: true })
db.chatRooms.createIndex({ createdAt: -1 })
db.chatRooms.createIndex({ participants: 1 })
```

**Field Descriptions:**
- `_id`: Unique room identifier
- `name`: Room display name (1-100 characters)
- `type`: Room category (game/regional/global)
- `blockchainEventId`: Associated blockchain event identifier
- `isRateLimited`: Whether rate limiting is currently active
- `rateLimitConfig`: Embedded document for rate limiting configuration
- `maxParticipants`: Maximum number of concurrent users
- `participants`: Array of user ObjectIds currently in the room
- `isActive`: Room availability status

### Messages Collection

```javascript
// MongoDB Schema Definition
{
  _id: ObjectId,
  roomId: {
    type: ObjectId,
    ref: 'ChatRoom',
    required: true
  },
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxLength: 2000
  },
  encryptedContent: {
    type: String,
    sparse: true
  },
  messageType: {
    type: String,
    enum: ['text', 'system', 'emoji', 'file'],
    default: 'text'
  },
  replyToId: {
    type: ObjectId,
    ref: 'Message',
    sparse: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}

// Indexes
db.messages.createIndex({ roomId: 1, createdAt: -1 })
db.messages.createIndex({ userId: 1, createdAt: -1 })
db.messages.createIndex({ replyToId: 1 }, { sparse: true })
db.messages.createIndex({ messageType: 1 })
db.messages.createIndex({ isDeleted: 1 })
db.messages.createIndex({ createdAt: -1 }) // For TTL cleanup

// TTL Index for automatic message cleanup (keep last 30 days)
db.messages.createIndex(
  { createdAt: 1 }, 
  { 
    expireAfterSeconds: 2592000, // 30 days
    partialFilterExpression: { isDeleted: true }
  }
)
```

**Field Descriptions:**
- `_id`: Unique message identifier
- `roomId`: Reference to the chat room
- `userId`: Reference to the message author
- `content`: Message content (max 2000 characters)
- `encryptedContent`: AES-256 encrypted message (optional)
- `messageType`: Type of message (text/system/emoji/file)
- `replyToId`: Reference to parent message for threads
- `isDeleted`: Soft deletion flag

### Room Participants Collection

```javascript
// MongoDB Schema Definition
{
  _id: ObjectId,
  roomId: {
    type: ObjectId,
    ref: 'ChatRoom',
    required: true
  },
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'moderator', 'member'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  isMuted: {
    type: Boolean,
    default: false
  },
  mutedUntil: {
    type: Date,
    sparse: true
  },
  lastSeenAt: {
    type: Date,
    default: Date.now
  }
}

// Compound unique index to prevent duplicate participation
db.roomParticipants.createIndex(
  { roomId: 1, userId: 1 }, 
  { unique: true }
)

// Additional indexes
db.roomParticipants.createIndex({ userId: 1, joinedAt: -1 })
db.roomParticipants.createIndex({ role: 1 })
db.roomParticipants.createIndex({ lastSeenAt: -1 })
db.roomParticipants.createIndex({ isMuted: 1 })
```

**Field Descriptions:**
- `_id`: Unique participation record identifier
- `roomId`: Reference to the chat room
- `userId`: Reference to the participant
- `role`: User's role in the room (admin/moderator/member)
- `joinedAt`: When user joined the room
- `isMuted`: Whether user is muted in this room
- `mutedUntil`: Expiration time for temporary mutes
- `lastSeenAt`: Last activity timestamp

### User Sessions Table (Redis Alternative)

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    device_info JSONB,
    ip_address INET,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_sessions_user_active ON user_sessions(user_id) WHERE is_active = true;
CREATE INDEX idx_user_sessions_token ON user_sessions(refresh_token_hash);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
```

### Rate Limit Tracking Table

```sql
CREATE TABLE rate_limit_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- 'message', 'join', 'leave'
    action_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, room_id, action_type, window_start)
);

-- Indexes
CREATE INDEX idx_rate_limit_window ON rate_limit_tracking(user_id, room_id, window_end);
CREATE INDEX idx_rate_limit_cleanup ON rate_limit_tracking(window_end);
```

## 🔧 Database Configuration

### MongoDB Configuration

```javascript
// mongodb.conf settings for production
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 2
      journalCompressor: snappy
    collectionConfig:
      blockCompressor: snappy
    indexConfig:
      prefixCompression: true

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 127.0.0.1

security:
  authorization: enabled

operationProfiling:
  slowOpThresholdMs: 100
  mode: slowOp
```

### Connection Configuration

```typescript
// Database connection configuration
const mongoConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ludopoly_chat',
  options: {
    maxPoolSize: 10,          // Maximum connections
    minPoolSize: 2,           // Minimum connections
    maxIdleTimeMS: 30000,     // Close idle connections after 30s
    serverSelectionTimeoutMS: 5000, // Return error after 5s if no server
    socketTimeoutMS: 45000,   // Close sockets after 45s of inactivity
    bufferMaxEntries: 0,      // Disable mongoose buffering
    bufferCommands: false,    // Disable mongoose buffering
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    w: 'majority'             // Write concern
  }
};
```

## 📈 Performance Optimizations

### Indexing Strategy

```javascript
// Compound indexes for common query patterns
db.messages.createIndex(
  { roomId: 1, createdAt: -1, isDeleted: 1 },
  { name: "messages_room_time_active" }
)

db.roomParticipants.createIndex(
  { roomId: 1, lastSeenAt: -1 },
  { name: "participants_room_activity" }
)

// Text search index for message content
db.messages.createIndex(
  { content: "text", roomId: 1 },
  { name: "messages_content_search" }
)

// Sparse indexes for optional fields
db.users.createIndex(
  { walletAddress: 1 },
  { sparse: true, unique: true }
)
```

### Query Optimizations

```javascript
// Aggregation pipeline for room statistics
db.chatRooms.aggregate([
  {
    $match: { isActive: true }
  },
  {
    $lookup: {
      from: "roomParticipants",
      localField: "_id",
      foreignField: "roomId",
      as: "participants"
    }
  },
  {
    $lookup: {
      from: "messages",
      let: { roomId: "$_id" },
      pipeline: [
        { $match: { 
          $expr: { $eq: ["$roomId", "$$roomId"] },
          isDeleted: false
        }},
        { $sort: { createdAt: -1 }},
        { $limit: 1 }
      ],
      as: "lastMessage"
    }
  },
  {
    $project: {
      name: 1,
      type: 1,
      participantCount: { $size: "$participants" },
      lastMessage: { $arrayElemAt: ["$lastMessage", 0] },
      createdAt: 1
    }
  }
])
```

### Sharding Strategy

```javascript
// Shard key for messages collection (for large deployments)
sh.shardCollection("ludopoly_chat.messages", { roomId: 1, createdAt: 1 })

// Shard key for users collection
sh.shardCollection("ludopoly_chat.users", { _id: "hashed" })
```

## 🗑️ Data Retention Policy

### Message Cleanup

```javascript
// Function to clean old messages (keep last 15 per room)
async function cleanupOldMessages() {
  const rooms = await db.chatRooms.find({}).toArray();
  
  for (const room of rooms) {
    // Get messages sorted by creation date (newest first)
    const messages = await db.messages.find(
      { roomId: room._id, isDeleted: false }
    ).sort({ createdAt: -1 }).toArray();
    
    // Mark messages beyond the 15th as deleted
    if (messages.length > 15) {
      const messagesToDelete = messages.slice(15).map(m => m._id);
      
      await db.messages.updateMany(
        { _id: { $in: messagesToDelete } },
        { 
          $set: { 
            isDeleted: true, 
            updatedAt: new Date() 
          }
        }
      );
    }
  }
}

// TTL cleanup for soft-deleted messages (remove after 30 days)
db.messages.createIndex(
  { updatedAt: 1 },
  { 
    expireAfterSeconds: 2592000, // 30 days
    partialFilterExpression: { isDeleted: true }
  }
)
```

### Session Cleanup

```javascript
// Cleanup expired user sessions and rate limit data
async function cleanupExpiredData() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  // Remove old room participants (inactive for 30 days)
  await db.roomParticipants.deleteMany({
    lastSeenAt: { $lt: thirtyDaysAgo }
  });
  
  // Clean up rate limiting data from Redis
  // This is handled by Redis TTL automatically
}
```

## 🔄 Migration Scripts

### Initial Migration

```sql
-- 001_initial_schema.sql
BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE room_type AS ENUM ('game', 'regional', 'global');
CREATE TYPE message_type AS ENUM ('text', 'system', 'emoji', 'file');
CREATE TYPE participant_role AS ENUM ('admin', 'moderator', 'member');

-- Create tables (as defined above)
-- ... table creation statements ...

-- Create initial indexes
-- ... index creation statements ...

-- Insert default data
INSERT INTO chat_rooms (name, type, max_participants) VALUES
('Global Chat', 'global', 1000),
('Regional: North America', 'regional', 500),
('Regional: Europe', 'regional', 500),
('Regional: Asia', 'regional', 500);

COMMIT;
```

### Migration for Rate Limiting

```sql
-- 002_add_rate_limiting.sql
BEGIN;

-- Add rate limiting columns to chat_rooms
ALTER TABLE chat_rooms 
ADD COLUMN IF NOT EXISTS is_rate_limited BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS rate_limit_config JSONB DEFAULT '{
    "activePeriod": 60,
    "cooldownPeriod": 300,
    "isEnabled": false,
    "currentPhase": "unlimited"
}'::jsonb;

-- Create rate limit tracking table
CREATE TABLE IF NOT EXISTS rate_limit_tracking (
    -- ... as defined above ...
);

COMMIT;
```

## 🔍 Common Queries

### Get Recent Messages for Room

```javascript
// MongoDB aggregation pipeline
db.messages.aggregate([
  {
    $match: {
      roomId: ObjectId("room_id_here"),
      isDeleted: false
    }
  },
  {
    $sort: { createdAt: -1 }
  },
  {
    $limit: 20
  },
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user",
      pipeline: [
        { $project: { username: 1, _id: 1 } }
      ]
    }
  },
  {
    $lookup: {
      from: "messages",
      localField: "replyToId",
      foreignField: "_id",
      as: "replyTo",
      pipeline: [
        { $project: { content: 1, _id: 1 } }
      ]
    }
  },
  {
    $project: {
      content: 1,
      messageType: 1,
      createdAt: 1,
      user: { $arrayElemAt: ["$user", 0] },
      replyTo: { $arrayElemAt: ["$replyTo", 0] }
    }
  },
  {
    $sort: { createdAt: 1 } // Return in chronological order
  }
])
```

### Get Active Room Participants

```javascript
// Get participants active in the last 5 minutes
const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

db.roomParticipants.aggregate([
  {
    $match: {
      roomId: ObjectId("room_id_here"),
      lastSeenAt: { $gte: fiveMinutesAgo }
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user",
      pipeline: [
        { $match: { isActive: true } },
        { $project: { username: 1, _id: 1 } }
      ]
    }
  },
  {
    $match: {
      "user.0": { $exists: true } // Only include active users
    }
  },
  {
    $project: {
      role: 1,
      joinedAt: 1,
      lastSeenAt: 1,
      user: { $arrayElemAt: ["$user", 0] }
    }
  },
  {
    $sort: { role: 1, joinedAt: 1 }
  }
])
```

### Get User's Rooms with Statistics

```javascript
// Get all rooms for a user with participant counts and last messages
db.roomParticipants.aggregate([
  {
    $match: { userId: ObjectId("user_id_here") }
  },
  {
    $lookup: {
      from: "chatRooms",
      localField: "roomId",
      foreignField: "_id",
      as: "room",
      pipeline: [
        { $match: { isActive: true } }
      ]
    }
  },
  {
    $match: {
      "room.0": { $exists: true }
    }
  },
  {
    $lookup: {
      from: "roomParticipants",
      localField: "roomId",
      foreignField: "roomId",
      as: "allParticipants"
    }
  },
  {
    $lookup: {
      from: "messages",
      let: { roomId: "$roomId" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$roomId", "$$roomId"] },
            isDeleted: false
          }
        },
        { $sort: { createdAt: -1 } },
        { $limit: 1 }
      ],
      as: "lastMessage"
    }
  },
  {
    $project: {
      role: 1,
      joinedAt: 1,
      lastSeenAt: 1,
      room: { $arrayElemAt: ["$room", 0] },
      participantCount: { $size: "$allParticipants" },
      lastMessage: { $arrayElemAt: ["$lastMessage", 0] }
    }
  },
  {
    $sort: { lastSeenAt: -1 }
  }
])
```

## 📊 Redis Schema

### Session Storage

```typescript
// Redis keys for session management
interface RedisKeys {
  userSession: `session:${userId}:${sessionId}`;
  userActiveRooms: `user:${userId}:rooms`;
  roomParticipants: `room:${roomId}:participants`;
  roomRateLimit: `room:${roomId}:ratelimit`;
  userTyping: `room:${roomId}:typing:${userId}`;
}

// Session data structure
interface SessionData {
  userId: string;
  refreshToken: string;
  deviceInfo: object;
  lastSeen: string;
  ipAddress: string;
}
```

### Rate Limiting

```typescript
// Rate limit data structure in Redis
interface RateLimitData {
  messageCount: number;
  windowStart: string;
  lastMessage: string;
  phase: 'unlimited' | 'active' | 'cooldown';
  phaseEndTime: string;
}
```

---

*This database schema documentation provides a comprehensive foundation for the Ludopoly Chat System's data layer using MongoDB, ensuring scalability, performance, and flexible document-based storage optimized for chat applications.*