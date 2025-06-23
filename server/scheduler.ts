import { storage } from "./storage";

// Daily cleanup scheduler - runs at midnight Madrid time
class DailyScheduler {
  private dailyCleanupInterval: NodeJS.Timeout | null = null;
  private weeklyResetInterval: NodeJS.Timeout | null = null;

  start() {
    console.log("Starting daily and weekly schedulers...");
    
    // Set up daily cleanup at midnight Madrid time
    this.scheduleDailyCleanup();
    
    // Set up weekly reset on Mondays at midnight Madrid time
    this.scheduleWeeklyReset();
    
    console.log("Schedulers started successfully");
  }

  private scheduleDailyCleanup() {
    const checkAndCleanup = async () => {
      const madridTime = storage.getMadridTime();
      const hour = madridTime.getHours();
      const minute = madridTime.getMinutes();
      
      // Run daily reset at midnight (00:00) Madrid time
      if (hour === 0 && minute === 0) {
        console.log("Running daily reset (view filtering only)...");
        await storage.clearPreviousDayFoodLogs();
      }
    };

    // Check every minute to catch the exact midnight moment
    this.dailyCleanupInterval = setInterval(checkAndCleanup, 60000);
    
    // Run daily reset check on startup (no data deletion)
    console.log("Running initial daily reset check on startup...");
    storage.clearPreviousDayFoodLogs();
  }

  private scheduleWeeklyReset() {
    const checkAndReset = async () => {
      const madridTime = storage.getMadridTime();
      const dayOfWeek = madridTime.getDay(); // 0 = Sunday, 1 = Monday
      const hour = madridTime.getHours();
      const minute = madridTime.getMinutes();
      
      // Run weekly reset on Mondays at midnight (00:00) Madrid time
      if (dayOfWeek === 1 && hour === 0 && minute === 0) {
        console.log("Running weekly points reset...");
        await storage.resetWeeklyPoints();
      }
    };

    // Check every minute to catch the exact midnight Monday moment
    this.weeklyResetInterval = setInterval(checkAndReset, 60000);
    
    // Also run reset on startup if it's Monday past midnight (in case server was down)
    checkAndReset();
  }

  stop() {
    if (this.dailyCleanupInterval) {
      clearInterval(this.dailyCleanupInterval);
      this.dailyCleanupInterval = null;
    }
    
    if (this.weeklyResetInterval) {
      clearInterval(this.weeklyResetInterval);
      this.weeklyResetInterval = null;
    }
    
    console.log("Schedulers stopped");
  }
}

export const dailyScheduler = new DailyScheduler();