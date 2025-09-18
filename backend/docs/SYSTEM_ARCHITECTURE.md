# 🏗️ Ludopoly Chat System - System Architecture

## 📋 Overview

The Ludopoly Chat System is a sophisticated real-time communication platform designed specifically for blockchain-enabled gaming environments. It provides secure, scalable, and feature-rich chat functionality with dynamic rate limiting based on blockchain events.

## 🎯 Core Features

### Chat Room Types
- **Game Rooms**: Dynamically created based on blockchain events
- **Regional Chat**: Geographic-based groupings for local communities
- **Global Chat**: Universal communication channel for all users

### Dynamic Rate Limiting
- **Initial State**: Unlimited messaging when room is first created
- **Blockchain Triggered**: Rate limiting activates after "World Created" blockchain event
- **Cycle Pattern**: 5-minute cooldown + 1-minute active chat period
- **Configurable**: Dynamic adjustment based on game state and room type

### Security & Privacy
- End-to-end message encryption using AES-256-GCM
- JWT-based authentication with refresh token support
- Advanced rate limiting and spam protection
- Content filtering and moderation capabilities

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  React Frontend  │  Mobile App  │  Game Client Integration     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│  Load Balancer  │  Rate Limiter  │  Authentication Middleware  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  REST API Server │  WebSocket Server │  Blockchain Listener    │
│  (Express.js)    │  (Socket.IO)      │  (Web3.js/Ethers.js)   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│  Chat Service  │  Room Service  │  Auth Service  │  Rate Limit │
│  User Service  │  Encryption   │  Blockchain    │  Moderation  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│   MongoDB    │  Redis Cache  │  IPFS Storage  │  Blockchain   │
│  (Primary)   │  (Sessions)   │  (Files)       │  (Events)     │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Technology Stack

### Backend Core
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js for REST API
- **WebSocket**: Socket.IO for real-time communication
- **Database**: MongoDB for document-based data storage
- **Caching**: Redis for session management and rate limiting

### Blockchain Integration
- **Library**: Ethers.js for blockchain interaction
- **Events**: Real-time smart contract event listening
- **Networks**: Ethereum mainnet/testnet support

### Security & Authentication
- **Authentication**: JWT with refresh token rotation
- **Encryption**: AES-256-GCM for message encryption
- **Hashing**: bcryptjs for password security
- **Headers**: Helmet.js for security headers

### Development & Deployment
- **Language**: TypeScript for type safety
- **Testing**: Jest for unit and integration tests
- **Containerization**: Docker for deployment
- **Process Management**: PM2 for production

## 📊 Data Flow Architecture

### Message Flow
```
User Input → Client Validation → WebSocket → Authentication Check 
→ Rate Limit Check → Encryption → Database Storage → Broadcast to Room
```

### Blockchain Event Flow
```
Smart Contract Event → Blockchain Listener → Event Processor 
→ Room Creation/Update → WebSocket Broadcast → Client Update
```

### Authentication Flow
```
Login Request → Credential Validation → JWT Generation 
→ Refresh Token Storage → Protected Route Access
```

## 🔄 Component Interaction Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │  WebSocket  │    │ Blockchain  │
│             │◄──►│   Server    │◄──►│  Listener   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   REST API  │    │ Rate Limit  │    │   Redis     │
│   Server    │◄──►│  Service    │◄──►│   Cache     │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ MongoDB      │    │ Encryption  │    │    IPFS     │
│  Database    │◄──►│  Service    │◄──►│   Storage   │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🚦 Rate Limiting Architecture

### State Machine Design
```
┌─────────────────┐
│   Room Created  │
│  (Unlimited)    │
└─────────────────┘
          │
          ▼ Blockchain Event: "World Created"
┌─────────────────┐
│  Rate Limited   │
│     Active      │
└─────────────────┘
          │
          ▼ Timer: 1 minute
┌─────────────────┐
│  Rate Limited   │
│    Cooldown     │
└─────────────────┘
          │
          ▼ Timer: 5 minutes
┌─────────────────┐
│  Rate Limited   │
│     Active      │
└─────────────────┘
```

### Implementation Pattern
```typescript
interface RateLimitState {
  roomId: string;
  isEnabled: boolean;
  currentPhase: 'unlimited' | 'active' | 'cooldown';
  phaseStartTime: Date;
  activeDuration: number;   // 60 seconds
  cooldownDuration: number; // 300 seconds
}
```

## 🔐 Security Architecture

### Multi-Layer Security Approach
```
┌─────────────────────────────────────────────────────────────┐
│                    Application Security                     │
├─────────────────────────────────────────────────────────────┤
│  Input Validation │ Output Encoding │ Error Handling      │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                   Communication Security                    │
├─────────────────────────────────────────────────────────────┤
│  HTTPS/WSS │ Message Encryption │ Token-based Auth        │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                     Data Security                          │
├─────────────────────────────────────────────────────────────┤
│  Database Encryption │ Password Hashing │ PII Protection  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                Infrastructure Security                      │
├─────────────────────────────────────────────────────────────┤
│  Network Security │ Container Security │ Access Control   │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Real-time Communication Flow

### WebSocket Event Lifecycle
```
Connection Established → Authentication → Room Join → Message Exchange 
→ Rate Limit Monitoring → Encryption/Decryption → Broadcast → Disconnect
```

### Event-Driven Architecture
```typescript
interface ChatEvents {
  // Inbound Events
  'user:join-room': (roomId: string) => void;
  'user:send-message': (messageData: MessageData) => void;
  'user:leave-room': (roomId: string) => void;
  
  // Outbound Events
  'room:message-received': (message: EncryptedMessage) => void;
  'room:user-joined': (user: PublicUserData) => void;
  'room:rate-limit-changed': (config: RateLimitConfig) => void;
  
  // System Events
  'blockchain:room-created': (roomData: RoomCreationEvent) => void;
  'blockchain:world-created': (worldData: WorldCreationEvent) => void;
  'system:maintenance-mode': (enabled: boolean) => void;
}
```

## 📈 Scalability Considerations

### Horizontal Scaling Strategy
- **Load Balancing**: Multiple server instances behind load balancer
- **Session Affinity**: Redis-based session storage for stateless servers
- **Database Sharding**: Partition by room_id for chat data distribution
- **Microservices**: Separate services for auth, chat, and blockchain

### Performance Optimization
- **Connection Pooling**: Database and Redis connection pooling
- **Message Batching**: Batch database writes for better throughput
- **Caching Strategy**: Multi-level caching (Redis + in-memory)
- **CDN Integration**: Static asset delivery optimization

## 🔄 Deployment Architecture

### Container Orchestration
```
┌─────────────────────────────────────────────────────────────┐
│                      Load Balancer                         │
│                        (Nginx)                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               Container Orchestration                       │
│                     (Docker Swarm)                         │
├─────────────────────────────────────────────────────────────┤
│  API Server   │  WebSocket   │  Blockchain  │  Worker      │
│  Container    │  Container   │  Listener    │  Container   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                            │
├─────────────────────────────────────────────────────────────┤
│   MongoDB     │    Redis     │     IPFS     │  Blockchain  │
│   Cluster     │   Cluster    │   Gateway    │   Network    │
└─────────────────────────────────────────────────────────────┘
```

## 🧪 Testing Strategy

### Test Pyramid
```
┌─────────────────────────────────┐
│           E2E Tests             │ ← Integration flows
├─────────────────────────────────┤
│         Integration Tests       │ ← Service interactions
├─────────────────────────────────┤
│           Unit Tests            │ ← Individual components
└─────────────────────────────────┘
```

### Test Coverage Areas
- **Unit Tests**: Business logic, utilities, and pure functions
- **Integration Tests**: Database operations, API endpoints, WebSocket events
- **Load Tests**: WebSocket connections, concurrent users, message throughput
- **Security Tests**: Authentication, authorization, rate limiting
- **Blockchain Tests**: Smart contract interaction, event handling

## 📊 Monitoring & Observability

### Metrics Collection
- **Application Metrics**: Response times, error rates, throughput
- **Business Metrics**: Active users, message volume, room utilization
- **Infrastructure Metrics**: CPU, memory, network, database performance
- **Security Metrics**: Failed authentication attempts, rate limit triggers

### Logging Strategy
```typescript
interface LogStructure {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  service: string;
  userId?: string;
  roomId?: string;
  action: string;
  metadata: Record<string, any>;
  traceId: string;
}
```

## 🔮 Future Enhancements

### Planned Features
- **AI Moderation**: ML-based content filtering and toxicity detection
- **Voice Chat**: WebRTC integration for voice communication
- **Message Reactions**: Emoji reactions and message threading
- **Advanced Analytics**: Real-time dashboard for system insights
- **Mobile SDK**: Native mobile integration library

### Scalability Roadmap
- **Message Archiving**: Long-term message storage with search capabilities
- **Global Distribution**: Multi-region deployment with data replication
- **Blockchain Agnostic**: Support for multiple blockchain networks
- **Plugin System**: Extensible architecture for custom features

---

*This architecture document serves as the foundation for the Ludopoly Chat System development and provides comprehensive guidance for implementation, scaling, and maintenance.*