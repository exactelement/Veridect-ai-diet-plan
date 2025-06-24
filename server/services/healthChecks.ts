import { db } from "../db";
import { users } from "@shared/schema";
import { count } from "drizzle-orm";

export class HealthCheckService {
  
  // Database connectivity check
  static async checkDatabase(): Promise<{ status: string; message?: string }> {
    try {
      const result = await db.select({ count: count() }).from(users);
      return { status: 'healthy' };
    } catch (error) {
      console.error('Database health check failed:', error);
      return { 
        status: 'unhealthy', 
        message: 'Database connection failed' 
      };
    }
  }
  
  // Environment variables check
  static checkEnvironment(): { status: string; missing?: string[] } {
    const required = [
      'DATABASE_URL',
      'GOOGLE_GEMINI_API_KEY'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      return { 
        status: 'unhealthy', 
        missing 
      };
    }
    
    return { status: 'healthy' };
  }
  
  // Memory usage check
  static checkMemory(): { status: string; usage?: any } {
    const usage = process.memoryUsage();
    const usageInMB = {
      rss: Math.round(usage.rss / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024)
    };
    
    // Alert if heap usage exceeds 1GB
    const status = usageInMB.heapUsed > 1024 ? 'warning' : 'healthy';
    
    return { status, usage: usageInMB };
  }
  
  // Comprehensive health check
  static async getHealthStatus() {
    const [database, environment, memory] = await Promise.all([
      this.checkDatabase(),
      Promise.resolve(this.checkEnvironment()),
      Promise.resolve(this.checkMemory())
    ]);
    
    const overall = [database.status, environment.status, memory.status]
      .every(status => status === 'healthy') ? 'healthy' : 'unhealthy';
    
    return {
      status: overall,
      timestamp: new Date().toISOString(),
      checks: {
        database,
        environment,
        memory
      }
    };
  }
}