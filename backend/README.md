# 🎮 Ludopoly Game Chat System - Backend

<div align="center">

![Ludopoly Logo](https://via.placeholder.com/200x100/4f46e5/ffffff?text=LUDOPOLY)

**Advanced Real-time Chat System for Blockchain Gaming**

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%5E5.0.0-blue)](https://www.typescriptlang.org/)
[![Socket.IO](https://img.shields.io/badge/socket.io-%5E4.7.0-black)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D6.0-green)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/redis-%3E%3D6.0-red)](https://redis.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

</div>

## 🌟 Overview

The Ludopoly Chat System is a sophisticated, blockchain-integrated real-time communication platform designed specifically for gaming environments. It features dynamic rate limiting, end-to-end encryption, and seamless integration with smart contracts to create an immersive gaming chat experience.

### ✨ Key Features

- 🔗 **Blockchain Integration**: Smart contract event-driven room creation and management
- 🚦 **Dynamic Rate Limiting**: Intelligent chat restrictions based on game state
- 🔒 **End-to-End Encryption**: AES-256-GCM message encryption for privacy
- ⚡ **Real-time Communication**: WebSocket-based instant messaging with Socket.IO
- 🛡️ **Advanced Security**: JWT authentication, role-based access control, and content moderation
- 📊 **Scalable Architecture**: Microservices-ready design with horizontal scaling support
- 🎯 **Multiple Room Types**: Game rooms, regional chat, and global communication channels

## 🏗️ Architecture

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

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **MongoDB** >= 6.0
- **Redis** >= 6.0
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ludopoly/ludopoly-Game.git
   cd ludopoly-Game/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   # Start MongoDB service
   sudo systemctl start mongod

   # Create database and collections (will be created automatically)
   # MongoDB creates databases and collections on first use
   
   # Seed initial data (optional)
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000` by default.

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```bash
# Server Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ludopoly_chat
DB_HOST=localhost
DB_PORT=27017
DB_NAME=ludopoly_chat
DB_USER=username
DB_PASSWORD=password
DB_SSL=false

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-refresh-token-secret-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Encryption Configuration
ENCRYPTION_MASTER_KEY=your-32-character-encryption-key

# Blockchain Configuration
WEB3_PROVIDER_URL=wss://mainnet.infura.io/ws/v3/your-project-id
SMART_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
BLOCKCHAIN_NETWORK=mainnet
PRIVATE_KEY=your-private-key-for-contract-interaction

# Rate Limiting Configuration
DEFAULT_ACTIVE_PERIOD=60
DEFAULT_COOLDOWN_PERIOD=300
DEFAULT_MESSAGES_PER_PERIOD=10

# External Services
PERSPECTIVE_API_KEY=your-perspective-api-key
IPFS_GATEWAY_URL=https://ipfs.io/ipfs/

# Monitoring & Logging
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn
PROMETHEUS_PORT=9090

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,https://ludopoly.com
```

### Database Setup

1. **Install and start MongoDB**
   ```bash
   # Install MongoDB (Ubuntu/Debian)
   sudo apt install mongodb-org
   
   # Start MongoDB service
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

2. **Create database and user** (optional, for authentication)
   ```javascript
   // Connect to MongoDB shell
   mongosh
   
   // Create database and user
   use ludopoly_chat
   db.createUser({
     user: "ludopoly_user",
     pwd: "your_password",
     roles: ["readWrite"]
   })
   ```

3. **Initialize collections** (automatic on first use)
   ```bash
   # Collections will be created automatically when first document is inserted
   # No migration needed for MongoDB
   ```

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/          # HTTP route controllers
│   │   ├── authController.ts
│   │   ├── chatController.ts
│   │   ├── roomController.ts
│   │   └── userController.ts
│   ├── services/            # Business logic services
│   │   ├── authService.ts
│   │   ├── chatService.ts
│   │   ├── roomService.ts
│   │   ├── blockchainService.ts
│   │   ├── rateLimitService.ts
│   │   └── encryptionService.ts
│   ├── models/              # Database models
│   │   ├── User.ts
│   │   ├── ChatRoom.ts
│   │   ├── Message.ts
│   │   └── RoomParticipant.ts
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts
│   │   ├── rateLimit.ts
│   │   ├── validation.ts
│   │   └── errorHandler.ts
│   ├── routes/              # API route definitions
│   │   ├── auth.ts
│   │   ├── chat.ts
│   │   ├── rooms.ts
│   │   └── users.ts
│   ├── sockets/             # WebSocket event handlers
│   │   ├── chatSocket.ts
│   │   ├── roomSocket.ts
│   │   └── authSocket.ts
│   ├── utils/               # Utility functions
│   │   ├── encryption.ts
│   │   ├── validation.ts
│   │   ├── logger.ts
│   │   └── constants.ts
│   ├── config/              # Configuration files
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── blockchain.ts
│   │   └── cors.ts
│   ├── types/               # TypeScript type definitions
│   │   ├── api.ts
│   │   ├── socket.ts
│   │   ├── blockchain.ts
│   │   └── database.ts
│   └── app.ts               # Express app configuration
├── docs/                    # Documentation
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_SCHEMA.md
│   └── SECURITY_BLOCKCHAIN.md
├── schemas/                 # MongoDB schema definitions
├── seeds/                   # Database seed files
├── tests/                   # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/                 # Utility scripts
├── docker/                  # Docker configuration
├── .env.example            # Environment variables template
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout

### Room Management
- `GET /api/v1/rooms` - Get all rooms
- `GET /api/v1/rooms/:id` - Get room details
- `POST /api/v1/rooms` - Create new room
- `POST /api/v1/rooms/:id/join` - Join room
- `POST /api/v1/rooms/:id/leave` - Leave room

### Messages
- `GET /api/v1/rooms/:id/messages` - Get room messages
- `POST /api/v1/rooms/:id/messages` - Send message
- `DELETE /api/v1/messages/:id` - Delete message

### User Profile
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile

For detailed API documentation, see [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md).

## 🔌 WebSocket Events

### Client to Server
- `join-room` - Join a chat room
- `send-message` - Send a message
- `leave-room` - Leave a chat room
- `typing-start` - Start typing indicator
- `typing-stop` - Stop typing indicator

### Server to Client
- `message-received` - New message in room
- `user-joined` - User joined room
- `user-left` - User left room
- `rate-limit-changed` - Rate limit configuration changed
- `room-created` - New room created (blockchain event)
- `user-typing` - User is typing
- `rate-limited` - Rate limit exceeded

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure authentication with access and refresh tokens
- **Role-Based Access Control**: Granular permissions system
- **Token Blacklisting**: Secure token revocation mechanism

### Message Security
- **End-to-End Encryption**: AES-256-GCM encryption for message content
- **Content Moderation**: AI-powered content filtering and manual moderation
- **Spam Protection**: Advanced rate limiting and duplicate message detection

### System Security
- **IP Rate Limiting**: Protection against DDoS and brute force attacks
- **Input Validation**: Comprehensive request validation and sanitization
- **SQL Injection Protection**: Parameterized queries and ORM usage
- **CORS Configuration**: Secure cross-origin resource sharing

For detailed security documentation, see [SECURITY_BLOCKCHAIN.md](./docs/SECURITY_BLOCKCHAIN.md).

## ⛓️ Blockchain Integration

### Smart Contract Events
- **Room Creation**: Automatic chat room creation on game start
- **World Creation**: Rate limiting activation when game world is established
- **Game State Changes**: Dynamic chat behavior based on game events

### Supported Networks
- Ethereum Mainnet
- Ethereum Testnets (Goerli, Sepolia)
- Polygon Network
- Binance Smart Chain

### Event Monitoring
The system continuously monitors blockchain events using WebSocket connections to smart contracts, ensuring real-time synchronization between game state and chat functionality.

## 🚦 Rate Limiting System

### Dynamic Rate Limiting
The chat system implements a sophisticated rate limiting mechanism that adapts based on blockchain events:

1. **Initial State**: Unlimited messaging when room is created
2. **Active Phase**: 1-minute window allowing limited messages (default: 10)
3. **Cooldown Phase**: 5-minute restriction period
4. **Cycle Repeat**: Continuous alternation between active and cooldown phases

### Configuration
Rate limiting can be configured per room type and adjusted dynamically based on game requirements.

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure
- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test service interactions and API endpoints
- **E2E Tests**: Test complete user workflows
- **Load Tests**: Test system performance under load

## 📊 Monitoring & Logging

### Logging
The system uses structured logging with different levels:
- `error`: System errors and exceptions
- `warn`: Warning conditions
- `info`: General information
- `debug`: Detailed debug information

### Metrics
Key metrics monitored:
- API response times
- WebSocket connection counts
- Message throughput
- Error rates
- Database performance

### Health Checks
- `GET /health` - System health status
- `GET /metrics` - Prometheus metrics
- Database connectivity
- Redis connectivity
- Blockchain connectivity

## 🚀 Deployment

### Docker Deployment

1. **Build Docker image**
   ```bash
   docker build -t ludopoly-chat-backend .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Production Deployment

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

### Environment-Specific Configurations

- **Development**: Hot reloading, debug logging, local databases
- **Staging**: Production-like environment for testing
- **Production**: Optimized performance, security hardening, monitoring

## 🔧 Performance Optimization

### Database Optimizations
- Connection pooling
- Query optimization
- Index strategies
- Partitioning for large tables

### Caching Strategy
- Redis for session storage
- In-memory caching for frequently accessed data
- Message history caching
- Rate limit counter caching

### WebSocket Optimizations
- Connection pooling
- Message batching
- Efficient room broadcasting
- Memory leak prevention

## 🤝 Contributing

We welcome contributions to the Ludopoly Chat System! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Add tests** for new functionality
5. **Ensure all tests pass** (`npm test`)
6. **Commit your changes** (`git commit -m 'Add amazing feature'`)
7. **Push to the branch** (`git push origin feature/amazing-feature`)
8. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Maintain test coverage above 80%
- Use conventional commit messages
- Update documentation for new features
- Ensure code passes linting and formatting checks

## 📚 Documentation

- [System Architecture](./docs/SYSTEM_ARCHITECTURE.md) - Comprehensive system design
- [API Documentation](./docs/API_DOCUMENTATION.md) - Complete API reference
- [Database Schema](./docs/DATABASE_SCHEMA.md) - Database design and structure
- [Security & Blockchain](./docs/SECURITY_BLOCKCHAIN.md) - Security measures and blockchain integration

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MongoDB service is running (`sudo systemctl status mongod`)
   - Verify MongoDB URI in `.env`
   - Ensure MongoDB is accessible on the specified port

2. **Redis Connection Failed**
   - Check Redis service is running
   - Verify Redis configuration in `.env`
   - Check Redis authentication if enabled

3. **Blockchain Connection Issues**
   - Verify Web3 provider URL is correct
   - Check network connectivity
   - Ensure smart contract address is valid

4. **WebSocket Connection Problems**
   - Check CORS configuration
   - Verify authentication tokens
   - Check firewall and proxy settings

### Debug Mode
Enable debug logging by setting `LOG_LEVEL=debug` in your `.env` file.

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed list of changes and version history.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 👥 Team

- **Backend Team**: Core chat system development
- **Blockchain Team**: Smart contract integration
- **Security Team**: Security architecture and auditing
- **DevOps Team**: Infrastructure and deployment

## 🔗 Related Projects

- [Ludopoly Frontend](../frontend/) - React-based user interface
- [Ludopoly Smart Contracts](https://github.com/Ludopoly/smart-contracts) - Blockchain contracts
- [Ludopoly Mobile](https://github.com/Ludopoly/mobile-app) - Mobile application

## 📞 Support

For support and questions:
- 📧 Email: support@ludopoly.com
- 💬 Discord: [Ludopoly Community](https://discord.gg/ludopoly)
- 📖 Documentation: [docs.ludopoly.com](https://docs.ludopoly.com)
- 🐛 Bug Reports: [GitHub Issues](https://github.com/Ludopoly/ludopoly-Game/issues)

---

<div align="center">

**Built with ❤️ by the Ludopoly Team**

[Website](https://ludopoly.com) • [Documentation](https://docs.ludopoly.com) • [Community](https://discord.gg/ludopoly)

</div>