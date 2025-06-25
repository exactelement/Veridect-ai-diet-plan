import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { dailyScheduler } from "./scheduler";
import { validateEnvironment, sanitizeInput } from "./middleware/validation";
import { AnalyticsCleanupService } from "./services/analyticsCleanup";
import path from "path";

// Validate environment on startup
validateEnvironment();

const app = express();

// Security headers - configured to allow essential services like Stripe
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP temporarily to ensure Stripe works
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://veridect.com', 'https://www.veridect.com'] 
    : ['http://localhost:5000', 'http://localhost:3000', 'http://127.0.0.1:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Additional security middleware
app.use(sanitizeInput);

// Serve static files from public directory
app.use(express.static(path.join(process.cwd(), 'public')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Comprehensive error handling middleware
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    
    // Log error details for debugging
    // Error logged for debugging in development only
    if (process.env.NODE_ENV === 'development') {
      // Error details available in development logs
    }
    
    // Don't expose internal errors to client in production
    if (status === 500 && process.env.NODE_ENV === 'production') {
      message = "Internal Server Error";
    }
    
    // Standardized error response format
    res.status(status).json({
      error: true,
      message,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // Use PORT environment variable for Cloud Run compatibility
  const port = process.env.PORT || 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // Start daily and weekly schedulers after server is running
    dailyScheduler.start();
    log(`Daily cleanup scheduled for midnight Madrid time`);
    log(`Weekly reset scheduled for Monday midnight Madrid time`);
  });

  // Graceful shutdown for Cloud Run
  process.on('SIGINT', () => {
    // Received SIGINT, shutting down gracefully
    dailyScheduler.stop();
    server.close(() => {
      // Process terminated
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    // Received SIGTERM, shutting down gracefully
    dailyScheduler.stop();
    server.close(() => {
      // Process terminated
      process.exit(0);
    });
  });
})();
