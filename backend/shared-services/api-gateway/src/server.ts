import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5000';

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://maula.ai',
    'https://*.maula.ai'
  ],
  credentials: true
}));

app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API Gateway is running',
    service: 'api-gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Proxy to Auth Service
app.use('/api/auth', createProxyMiddleware({
  target: AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth'
  },
  onError: (err, req, res) => {
    console.error('Proxy error to auth service:', err);
    (res as Response).status(502).json({
      success: false,
      message: 'Auth service unavailable'
    });
  }
}));

// Proxy to FraudGuard (Tool 01) - will add after Phase 2
app.use('/api/fraudguard', createProxyMiddleware({
  target: 'http://fraudguard-api:4001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/fraudguard': '/api'
  },
  onError: (err, req, res) => {
    (res as Response).status(502).json({
      success: false,
      message: 'FraudGuard service unavailable'
    });
  }
}));

// ... Add more tool proxies here (will add in Phase 3)

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Gateway error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ==========================================');
  console.log('🌐 MAULA.AI - API Gateway');
  console.log('🚀 ==========================================');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Auth proxy: http://localhost:${PORT}/api/auth -> ${AUTH_SERVICE_URL}`);
  console.log('🚀 ==========================================');
  console.log('');
});

export default app;
