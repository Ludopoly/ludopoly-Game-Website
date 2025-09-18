# 🛡️ Ludopoly Chat System - Security & Blockchain Integration

## 🔒 Security Overview

The Ludopoly Chat System implements a multi-layered security approach combining modern cryptographic standards, blockchain integration, and robust authentication mechanisms to ensure data privacy, user security, and system integrity.

## 🔐 Authentication & Authorization

### JWT Token System

#### Token Structure
```typescript
interface JWTPayload {
  // Standard claims
  iss: string;          // Issuer: "ludopoly-chat"
  sub: string;          // Subject: user ID
  aud: string;          // Audience: "ludopoly-clients"
  iat: number;          // Issued at timestamp
  exp: number;          // Expiration timestamp
  jti: string;          // JWT ID for revocation
  
  // Custom claims
  userId: string;       // User identifier
  username: string;     // Display name
  email: string;        // User email
  walletAddress?: string; // Blockchain wallet
  roles: string[];      // User roles
  permissions: string[]; // Granular permissions
}
```

#### Token Lifecycle Management
```typescript
class TokenManager {
  // Access token: 15 minutes
  private readonly ACCESS_TOKEN_EXPIRY = 15 * 60; // 900 seconds
  
  // Refresh token: 7 days
  private readonly REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 604800 seconds
  
  async generateTokenPair(user: User): Promise<TokenPair> {
    const payload: JWTPayload = {
      iss: 'ludopoly-chat',
      sub: user.id,
      aud: 'ludopoly-clients',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.ACCESS_TOKEN_EXPIRY,
      jti: uuidv4(),
      userId: user.id,
      username: user.username,
      email: user.email,
      walletAddress: user.walletAddress,
      roles: user.roles,
      permissions: user.permissions
    };
    
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!);
    const refreshToken = jwt.sign(
      { userId: user.id, jti: uuidv4() },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );
    
    // Store refresh token hash in database
    await this.storeRefreshToken(user.id, refreshToken);
    
    return { accessToken, refreshToken };
  }
}
```

### Role-Based Access Control (RBAC)

```typescript
enum Permission {
  // Room permissions
  CREATE_ROOM = 'room:create',
  DELETE_ROOM = 'room:delete',
  MODERATE_ROOM = 'room:moderate',
  MANAGE_PARTICIPANTS = 'room:manage_participants',
  
  // Message permissions
  SEND_MESSAGE = 'message:send',
  DELETE_MESSAGE = 'message:delete',
  DELETE_ANY_MESSAGE = 'message:delete_any',
  EDIT_MESSAGE = 'message:edit',
  
  // Admin permissions
  MANAGE_USERS = 'admin:manage_users',
  VIEW_ANALYTICS = 'admin:analytics',
  MANAGE_SYSTEM = 'admin:system'
}

enum Role {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

const rolePermissions: Record<Role, Permission[]> = {
  [Role.USER]: [
    Permission.SEND_MESSAGE,
    Permission.DELETE_MESSAGE,
    Permission.EDIT_MESSAGE
  ],
  [Role.MODERATOR]: [
    ...rolePermissions[Role.USER],
    Permission.DELETE_ANY_MESSAGE,
    Permission.MODERATE_ROOM,
    Permission.MANAGE_PARTICIPANTS
  ],
  [Role.ADMIN]: [
    ...rolePermissions[Role.MODERATOR],
    Permission.CREATE_ROOM,
    Permission.DELETE_ROOM,
    Permission.MANAGE_USERS,
    Permission.VIEW_ANALYTICS
  ],
  [Role.SUPER_ADMIN]: [
    ...rolePermissions[Role.ADMIN],
    Permission.MANAGE_SYSTEM
  ]
};
```

### Authentication Middleware

```typescript
import { RateLimiterRedis } from 'rate-limiter-flexible';

class AuthenticationMiddleware {
  private rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyGens: ['login'],
    points: 5,           // 5 attempts
    duration: 900,       // Per 15 minutes
    blockDuration: 900,  // Block for 15 minutes
  });
  
  async authenticate(req: Request, res: Response, next: NextFunction) {
    try {
      const token = this.extractToken(req);
      if (!token) {
        return res.status(401).json({ 
          error: 'UNAUTHORIZED', 
          message: 'Access token required' 
        });
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      
      // Check if token is blacklisted
      const isBlacklisted = await this.isTokenBlacklisted(decoded.jti);
      if (isBlacklisted) {
        return res.status(401).json({ 
          error: 'TOKEN_REVOKED', 
          message: 'Token has been revoked' 
        });
      }
      
      // Attach user to request
      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ 
          error: 'TOKEN_EXPIRED', 
          message: 'Access token has expired' 
        });
      }
      
      return res.status(401).json({ 
        error: 'INVALID_TOKEN', 
        message: 'Invalid access token' 
      });
    }
  }
  
  async requirePermission(permission: Permission) {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = req.user as JWTPayload;
      
      if (!user.permissions.includes(permission)) {
        return res.status(403).json({
          error: 'INSUFFICIENT_PERMISSIONS',
          message: `Required permission: ${permission}`
        });
      }
      
      next();
    };
  }
}
```

## 🔒 Message Encryption

### End-to-End Encryption Implementation

```typescript
import crypto from 'crypto';

class MessageEncryption {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32; // 256 bits
  private static readonly IV_LENGTH = 16;  // 128 bits
  private static readonly TAG_LENGTH = 16; // 128 bits
  
  static async generateRoomKey(roomId: string): Promise<Buffer> {
    // Derive deterministic key from room ID and server secret
    const roomSecret = crypto.createHmac('sha256', process.env.ENCRYPTION_MASTER_KEY!)
      .update(roomId)
      .digest();
    
    return roomSecret.slice(0, this.KEY_LENGTH);
  }
  
  static encrypt(plaintext: string, roomKey: Buffer): EncryptedMessage {
    try {
      const iv = crypto.randomBytes(this.IV_LENGTH);
      const cipher = crypto.createCipher(this.ALGORITHM, roomKey, iv);
      
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        algorithm: this.ALGORITHM
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }
  
  static decrypt(encryptedMessage: EncryptedMessage, roomKey: Buffer): string {
    try {
      const iv = Buffer.from(encryptedMessage.iv, 'hex');
      const tag = Buffer.from(encryptedMessage.tag, 'hex');
      
      const decipher = crypto.createDecipher(this.ALGORITHM, roomKey, iv);
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encryptedMessage.encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }
}

interface EncryptedMessage {
  encryptedData: string;
  iv: string;
  tag: string;
  algorithm: string;
}
```

### Key Management

```typescript
class KeyManager {
  private keyCache = new Map<string, { key: Buffer; expiry: number }>();
  private readonly KEY_CACHE_TTL = 3600000; // 1 hour
  
  async getRoomKey(roomId: string): Promise<Buffer> {
    // Check cache first
    const cached = this.keyCache.get(roomId);
    if (cached && cached.expiry > Date.now()) {
      return cached.key;
    }
    
    // Generate or retrieve key
    const key = await MessageEncryption.generateRoomKey(roomId);
    
    // Cache the key
    this.keyCache.set(roomId, {
      key,
      expiry: Date.now() + this.KEY_CACHE_TTL
    });
    
    return key;
  }
  
  async rotateRoomKey(roomId: string): Promise<void> {
    // Remove from cache to force regeneration
    this.keyCache.delete(roomId);
    
    // Generate new key
    await this.getRoomKey(roomId);
    
    // Broadcast key rotation event to room participants
    this.broadcastKeyRotation(roomId);
  }
}
```

## 🚦 Rate Limiting System

### Dynamic Rate Limiting

```typescript
interface RateLimitConfig {
  isEnabled: boolean;
  activePeriod: number;     // seconds (default: 60)
  cooldownPeriod: number;   // seconds (default: 300)
  currentPhase: 'unlimited' | 'active' | 'cooldown';
  phaseStartTime: Date;
  messagesPerActivePeriod: number; // default: 10
}

class RateLimitService {
  private roomConfigs = new Map<string, RateLimitConfig>();
  private userCounters = new Map<string, UserRateLimit>();
  
  async initializeRoom(roomId: string): Promise<void> {
    const config: RateLimitConfig = {
      isEnabled: false,
      activePeriod: 60,
      cooldownPeriod: 300,
      currentPhase: 'unlimited',
      phaseStartTime: new Date(),
      messagesPerActivePeriod: 10
    };
    
    this.roomConfigs.set(roomId, config);
  }
  
  async enableRateLimit(roomId: string): Promise<void> {
    const config = this.roomConfigs.get(roomId);
    if (!config) return;
    
    config.isEnabled = true;
    config.currentPhase = 'active';
    config.phaseStartTime = new Date();
    
    // Start the rate limiting cycle
    this.startRateLimitCycle(roomId);
    
    // Broadcast configuration change
    this.broadcastRateLimitChange(roomId, config);
  }
  
  private async startRateLimitCycle(roomId: string): Promise<void> {
    const config = this.roomConfigs.get(roomId);
    if (!config || !config.isEnabled) return;
    
    // Active phase timer
    setTimeout(() => {
      this.enterCooldownPhase(roomId);
    }, config.activePeriod * 1000);
  }
  
  private async enterCooldownPhase(roomId: string): Promise<void> {
    const config = this.roomConfigs.get(roomId);
    if (!config) return;
    
    config.currentPhase = 'cooldown';
    config.phaseStartTime = new Date();
    
    this.broadcastRateLimitChange(roomId, config);
    
    // Cooldown phase timer
    setTimeout(() => {
      this.enterActivePhase(roomId);
    }, config.cooldownPeriod * 1000);
  }
  
  private async enterActivePhase(roomId: string): Promise<void> {
    const config = this.roomConfigs.get(roomId);
    if (!config || !config.isEnabled) return;
    
    config.currentPhase = 'active';
    config.phaseStartTime = new Date();
    
    // Reset user counters
    this.resetUserCounters(roomId);
    
    this.broadcastRateLimitChange(roomId, config);
    
    // Continue the cycle
    this.startRateLimitCycle(roomId);
  }
  
  async canSendMessage(roomId: string, userId: string): Promise<RateLimitResult> {
    const config = this.roomConfigs.get(roomId);
    if (!config || !config.isEnabled || config.currentPhase === 'unlimited') {
      return { allowed: true };
    }
    
    if (config.currentPhase === 'cooldown') {
      const remainingTime = this.getRemainingCooldownTime(config);
      return {
        allowed: false,
        reason: 'COOLDOWN_ACTIVE',
        retryAfter: remainingTime
      };
    }
    
    // Check user message count in active phase
    const userKey = `${roomId}:${userId}`;
    const userLimit = this.userCounters.get(userKey) || { count: 0, windowStart: new Date() };
    
    if (userLimit.count >= config.messagesPerActivePeriod) {
      return {
        allowed: false,
        reason: 'MESSAGE_LIMIT_REACHED',
        retryAfter: this.getRemainingActiveTime(config)
      };
    }
    
    // Increment counter
    userLimit.count++;
    this.userCounters.set(userKey, userLimit);
    
    return { allowed: true };
  }
}

interface RateLimitResult {
  allowed: boolean;
  reason?: 'COOLDOWN_ACTIVE' | 'MESSAGE_LIMIT_REACHED';
  retryAfter?: number;
}
```

### IP-Based Rate Limiting

```typescript
import { RateLimiterRedis } from 'rate-limiter-flexible';

class IPRateLimiter {
  private limiters = {
    // General API rate limiting
    api: new RateLimiterRedis({
      storeClient: redisClient,
      keyGen: (req) => req.ip,
      points: 100,          // requests
      duration: 60,         // per 60 seconds
      blockDuration: 60,
    }),
    
    // Authentication rate limiting
    auth: new RateLimiterRedis({
      storeClient: redisClient,
      keyGen: (req) => req.ip,
      points: 5,            // attempts
      duration: 900,        // per 15 minutes
      blockDuration: 900,
    }),
    
    // WebSocket connection rate limiting
    websocket: new RateLimiterRedis({
      storeClient: redisClient,
      keyGen: (req) => req.ip,
      points: 10,           // connections
      duration: 60,         // per minute
      blockDuration: 300,
    })
  };
  
  async checkRateLimit(type: keyof typeof this.limiters, req: Request): Promise<void> {
    try {
      await this.limiters[type].consume(req);
    } catch (rejRes) {
      const remainingPoints = rejRes.remainingPoints || 0;
      const msBeforeNext = rejRes.msBeforeNext || 0;
      
      throw new RateLimitError(
        `Rate limit exceeded for ${type}`,
        Math.round(msBeforeNext / 1000),
        remainingPoints
      );
    }
  }
}
```

## ⛓️ Blockchain Integration

### Smart Contract Event Monitoring

```typescript
import { ethers } from 'ethers';

class BlockchainEventListener {
  private provider: ethers.WebSocketProvider;
  private contract: ethers.Contract;
  private eventFilters: Map<string, ethers.EventFilter> = new Map();
  
  constructor() {
    this.provider = new ethers.WebSocketProvider(process.env.WEB3_PROVIDER_URL!);
    this.contract = new ethers.Contract(
      process.env.SMART_CONTRACT_ADDRESS!,
      contractABI,
      this.provider
    );
    
    this.setupEventFilters();
  }
  
  private setupEventFilters(): void {
    // Room creation event filter
    this.eventFilters.set('RoomCreated', this.contract.filters.RoomCreated());
    
    // World creation event filter (triggers rate limiting)
    this.eventFilters.set('WorldCreated', this.contract.filters.WorldCreated());
    
    // Game state change events
    this.eventFilters.set('GameStateChanged', this.contract.filters.GameStateChanged());
  }
  
  async startListening(): Promise<void> {
    // Listen for room creation events
    this.contract.on('RoomCreated', async (roomId, gameId, creator, timestamp, event) => {
      await this.handleRoomCreated({
        roomId: roomId.toString(),
        gameId: gameId.toString(),
        creator,
        timestamp: new Date(timestamp.toNumber() * 1000),
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber
      });
    });
    
    // Listen for world creation events
    this.contract.on('WorldCreated', async (roomId, worldData, timestamp, event) => {
      await this.handleWorldCreated({
        roomId: roomId.toString(),
        worldData,
        timestamp: new Date(timestamp.toNumber() * 1000),
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber
      });
    });
    
    // Handle connection errors
    this.provider.on('error', (error) => {
      logger.error('Blockchain provider error:', error);
      this.reconnect();
    });
  }
  
  private async handleRoomCreated(eventData: RoomCreatedEvent): Promise<void> {
    try {
      // Create chat room in database
      const room = await chatService.createRoom({
        name: `Game Room ${eventData.gameId}`,
        type: 'game',
        blockchainEventId: eventData.transactionHash,
        maxParticipants: 8, // Typical game room size
        isActive: true
      });
      
      // Initialize rate limiting for the room
      await rateLimitService.initializeRoom(room.id);
      
      // Broadcast room creation to clients
      socketService.broadcastToAll('room-created', {
        room,
        blockchainEvent: eventData
      });
      
      logger.info(`Room created for game ${eventData.gameId}`, { 
        roomId: room.id, 
        transactionHash: eventData.transactionHash 
      });
    } catch (error) {
      logger.error('Failed to handle room creation event:', error);
    }
  }
  
  private async handleWorldCreated(eventData: WorldCreatedEvent): Promise<void> {
    try {
      // Find the associated room
      const room = await chatService.getRoomByBlockchainEvent(eventData.transactionHash);
      if (!room) {
        logger.warn(`No room found for world creation event: ${eventData.transactionHash}`);
        return;
      }
      
      // Enable rate limiting for the room
      await rateLimitService.enableRateLimit(room.id);
      
      // Broadcast rate limit activation
      socketService.broadcastToRoom(room.id, 'world-created', {
        roomId: room.id,
        rateLimitEnabled: true,
        worldData: eventData.worldData
      });
      
      logger.info(`Rate limiting enabled for room ${room.id}`, {
        transactionHash: eventData.transactionHash
      });
    } catch (error) {
      logger.error('Failed to handle world creation event:', error);
    }
  }
  
  private async reconnect(): Promise<void> {
    logger.info('Attempting to reconnect to blockchain provider...');
    
    try {
      await this.provider.destroy();
      this.provider = new ethers.WebSocketProvider(process.env.WEB3_PROVIDER_URL!);
      this.contract = new ethers.Contract(
        process.env.SMART_CONTRACT_ADDRESS!,
        contractABI,
        this.provider
      );
      
      await this.startListening();
      logger.info('Successfully reconnected to blockchain provider');
    } catch (error) {
      logger.error('Failed to reconnect to blockchain provider:', error);
      
      // Retry after delay
      setTimeout(() => this.reconnect(), 5000);
    }
  }
}
```

### Blockchain Security Measures

```typescript
class BlockchainSecurity {
  // Verify event authenticity
  async verifyEventAuthenticity(event: BlockchainEvent): Promise<boolean> {
    try {
      // Get transaction receipt
      const receipt = await this.provider.getTransactionReceipt(event.transactionHash);
      if (!receipt) return false;
      
      // Verify the transaction was successful
      if (receipt.status !== 1) return false;
      
      // Verify the event was emitted by our contract
      if (receipt.to?.toLowerCase() !== process.env.SMART_CONTRACT_ADDRESS?.toLowerCase()) {
        return false;
      }
      
      // Verify block confirmations (at least 3)
      const currentBlock = await this.provider.getBlockNumber();
      const confirmations = currentBlock - receipt.blockNumber;
      
      return confirmations >= 3;
    } catch (error) {
      logger.error('Failed to verify event authenticity:', error);
      return false;
    }
  }
  
  // Prevent replay attacks
  async checkEventProcessed(transactionHash: string): Promise<boolean> {
    const processed = await redis.get(`processed_event:${transactionHash}`);
    return processed !== null;
  }
  
  async markEventProcessed(transactionHash: string): Promise<void> {
    // Store for 24 hours to prevent replay
    await redis.setex(`processed_event:${transactionHash}`, 86400, 'true');
  }
}
```

## 🛡️ Content Security & Moderation

### Content Filtering

```typescript
class ContentModerationService {
  private profanityFilter: RegExp[];
  private suspiciousPatterns: RegExp[];
  
  constructor() {
    this.profanityFilter = this.loadProfanityList();
    this.suspiciousPatterns = [
      /discord\.gg\/[a-zA-Z0-9]+/gi,     // Discord invites
      /t\.me\/[a-zA-Z0-9_]+/gi,          // Telegram links
      /https?:\/\/[^\s]+/gi,             // Generic URLs
      /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, // IP addresses
    ];
  }
  
  async moderateMessage(content: string, userId: string): Promise<ModerationResult> {
    const violations: ModerationViolation[] = [];
    
    // Check for profanity
    const profanityViolations = this.checkProfanity(content);
    violations.push(...profanityViolations);
    
    // Check for spam patterns
    const spamViolations = await this.checkSpamPatterns(content, userId);
    violations.push(...spamViolations);
    
    // Check for suspicious links
    const linkViolations = this.checkSuspiciousLinks(content);
    violations.push(...linkViolations);
    
    // Determine action based on violations
    const action = this.determineAction(violations);
    
    return {
      allowed: action === 'allow',
      action,
      violations,
      filteredContent: this.filterContent(content, violations)
    };
  }
  
  private checkProfanity(content: string): ModerationViolation[] {
    const violations: ModerationViolation[] = [];
    
    for (const pattern of this.profanityFilter) {
      const matches = content.match(pattern);
      if (matches) {
        violations.push({
          type: 'profanity',
          severity: 'medium',
          description: 'Message contains profanity',
          matches
        });
      }
    }
    
    return violations;
  }
  
  private async checkSpamPatterns(content: string, userId: string): Promise<ModerationViolation[]> {
    const violations: ModerationViolation[] = [];
    
    // Check message frequency
    const recentMessages = await this.getRecentUserMessages(userId, 60); // Last minute
    if (recentMessages.length > 10) {
      violations.push({
        type: 'spam',
        severity: 'high',
        description: 'Too many messages in short time period'
      });
    }
    
    // Check for repeated content
    const duplicateCount = recentMessages.filter(msg => msg.content === content).length;
    if (duplicateCount > 2) {
      violations.push({
        type: 'spam',
        severity: 'medium',
        description: 'Repeated message content'
      });
    }
    
    return violations;
  }
}
```

### AI-Powered Moderation

```typescript
class AIModeration {
  private toxicityThreshold = 0.7;
  private spamThreshold = 0.8;
  
  async analyzeMessage(content: string): Promise<AIAnalysisResult> {
    try {
      // Call external AI service (e.g., Perspective API)
      const response = await axios.post('https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze', {
        requestedAttributes: {
          TOXICITY: {},
          SPAM: {},
          PROFANITY: {},
          THREAT: {}
        },
        comment: { text: content },
        languages: ['en']
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.PERSPECTIVE_API_KEY}`
        }
      });
      
      const scores = response.data.attributeScores;
      
      return {
        toxicity: scores.TOXICITY.summaryScore.value,
        spam: scores.SPAM.summaryScore.value,
        profanity: scores.PROFANITY.summaryScore.value,
        threat: scores.THREAT.summaryScore.value,
        requiresReview: this.requiresHumanReview(scores)
      };
    } catch (error) {
      logger.error('AI moderation failed:', error);
      return { requiresReview: true }; // Fail safe
    }
  }
  
  private requiresHumanReview(scores: any): boolean {
    return scores.TOXICITY.summaryScore.value > this.toxicityThreshold ||
           scores.SPAM.summaryScore.value > this.spamThreshold ||
           scores.THREAT.summaryScore.value > 0.5;
  }
}
```

## 🔒 Data Protection & Privacy

### GDPR Compliance

```typescript
class DataProtectionService {
  // Right to Access
  async exportUserData(userId: string): Promise<UserDataExport> {
    const userData = await userService.getUserById(userId);
    const messages = await messageService.getUserMessages(userId);
    const rooms = await roomService.getUserRooms(userId);
    
    return {
      profile: {
        username: userData.username,
        email: userData.email,
        walletAddress: userData.walletAddress,
        createdAt: userData.createdAt
      },
      messages: messages.map(msg => ({
        content: msg.content,
        roomName: msg.room.name,
        createdAt: msg.createdAt
      })),
      rooms: rooms.map(room => ({
        name: room.name,
        type: room.type,
        joinedAt: room.joinedAt
      }))
    };
  }
  
  // Right to Erasure
  async deleteUserData(userId: string): Promise<void> {
    await database.transaction(async (trx) => {
      // Anonymize messages instead of deleting (for chat continuity)
      await trx('messages')
        .where('user_id', userId)
        .update({
          content: '[Message deleted]',
          encrypted_content: null,
          user_id: null
        });
      
      // Remove from room participants
      await trx('room_participants').where('user_id', userId).del();
      
      // Delete user record
      await trx('users').where('id', userId).del();
      
      // Clear cached data
      await redis.del(`user:${userId}:*`);
    });
  }
  
  // Data minimization
  async cleanupOldData(): Promise<void> {
    const retentionPeriod = 90 * 24 * 60 * 60 * 1000; // 90 days
    const cutoffDate = new Date(Date.now() - retentionPeriod);
    
    // Delete old messages beyond room retention limit
    await database('messages')
      .where('created_at', '<', cutoffDate)
      .whereNotIn('id', function() {
        this.select('id')
          .from('messages as m2')
          .whereRaw('m2.room_id = messages.room_id')
          .orderBy('created_at', 'desc')
          .limit(15);
      })
      .del();
  }
}
```

## 🔍 Security Monitoring & Alerts

### Security Event Detection

```typescript
class SecurityMonitoring {
  private suspiciousActivityThresholds = {
    failedLogins: 5,
    rapidRequests: 100,
    unusualTimingPatterns: true
  };
  
  async detectSuspiciousActivity(event: SecurityEvent): Promise<void> {
    switch (event.type) {
      case 'failed_login':
        await this.handleFailedLogin(event);
        break;
      case 'rapid_requests':
        await this.handleRapidRequests(event);
        break;
      case 'privilege_escalation':
        await this.handlePrivilegeEscalation(event);
        break;
    }
  }
  
  private async handleFailedLogin(event: SecurityEvent): Promise<void> {
    const key = `failed_logins:${event.ipAddress}:${event.userId}`;
    const count = await redis.incr(key);
    await redis.expire(key, 3600); // 1 hour window
    
    if (count >= this.suspiciousActivityThresholds.failedLogins) {
      await this.triggerSecurityAlert({
        type: 'BRUTE_FORCE_ATTEMPT',
        severity: 'HIGH',
        ipAddress: event.ipAddress,
        userId: event.userId,
        count
      });
    }
  }
  
  private async triggerSecurityAlert(alert: SecurityAlert): Promise<void> {
    // Log the alert
    logger.warn('Security alert triggered', alert);
    
    // Send to monitoring system
    await this.sendToMonitoring(alert);
    
    // Take automated action if necessary
    if (alert.severity === 'HIGH') {
      await this.takeAutomatedAction(alert);
    }
  }
  
  private async takeAutomatedAction(alert: SecurityAlert): Promise<void> {
    switch (alert.type) {
      case 'BRUTE_FORCE_ATTEMPT':
        // Temporarily block IP
        await this.blockIP(alert.ipAddress!, 3600); // 1 hour
        break;
      case 'SUSPICIOUS_TOKEN_USAGE':
        // Revoke tokens
        await this.revokeUserTokens(alert.userId!);
        break;
    }
  }
}
```

---

*This security documentation provides comprehensive protection measures for the Ludopoly Chat System, ensuring data privacy, system integrity, and user safety through multiple layers of security controls.*