import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error, retryCount: number) => void;
}

export function useErrorRecovery(options: ErrorRecoveryOptions = {}) {
  const { maxRetries = 3, retryDelay = 1000, onError } = options;
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const { toast } = useToast();

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    errorMessage?: string
  ): Promise<T> => {
    try {
      const result = await operation();
      // Reset retry count on success
      if (retryCount > 0) {
        setRetryCount(0);
      }
      return result;
    } catch (error) {
      const currentRetry = retryCount + 1;
      
      if (currentRetry <= maxRetries) {
        setRetryCount(currentRetry);
        setIsRetrying(true);
        
        // Call custom error handler
        onError?.(error as Error, currentRetry);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * currentRetry));
        
        setIsRetrying(false);
        
        // Retry the operation
        return executeWithRetry(operation, errorMessage);
      } else {
        // Max retries exceeded
        setRetryCount(0);
        setIsRetrying(false);
        
        toast({
          title: "Operation Failed",
          description: errorMessage || (error as Error).message,
          variant: "destructive",
        });
        
        throw error;
      }
    }
  }, [retryCount, maxRetries, retryDelay, onError, toast]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    executeWithRetry,
    retryCount,
    isRetrying,
    reset
  };
}