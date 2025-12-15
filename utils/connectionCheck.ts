
/**
 * Connection Check Utility
 * 
 * Provides functions to check if the backend server is accessible
 */

import api from '@/app/api/client';

export interface ConnectionStatus {
  isConnected: boolean;
  error?: string;
  lastChecked: Date;
}

/**
 * Check if the backend server is accessible
 * @param timeout - Timeout in milliseconds (default: 5000)
 * @returns ConnectionStatus object
 */
export const checkBackendConnection = async (timeout: number = 5000): Promise<ConnectionStatus> => {
  const startTime = Date.now();
  
  try {
    console.log('Checking backend connection...');
    
    // Create a promise that rejects after timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), timeout);
    });
    
    // Race between the health check and timeout
    const response = await Promise.race([
      api.healthCheck(),
      timeoutPromise,
    ]);
    
    const elapsed = Date.now() - startTime;
    console.log(`Backend connection check completed in ${elapsed}ms`);
    
    if (response.success) {
      console.log('Backend is accessible');
      return {
        isConnected: true,
        lastChecked: new Date(),
      };
    } else {
      console.log('Backend returned error:', response.error);
      return {
        isConnected: false,
        error: response.error || 'Backend returned an error',
        lastChecked: new Date(),
      };
    }
  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    console.error(`Backend connection check failed after ${elapsed}ms:`, error);
    
    return {
      isConnected: false,
      error: error.message || 'Unable to connect to backend',
      lastChecked: new Date(),
    };
  }
};

/**
 * Check if the backend is accessible with a quick timeout
 * Useful for UI checks that shouldn't block for too long
 */
export const quickConnectionCheck = async (): Promise<boolean> => {
  const status = await checkBackendConnection(3000);
  return status.isConnected;
};

/**
 * Continuously monitor backend connection
 * @param onStatusChange - Callback when connection status changes
 * @param interval - Check interval in milliseconds (default: 10000)
 * @returns Function to stop monitoring
 */
export const monitorConnection = (
  onStatusChange: (status: ConnectionStatus) => void,
  interval: number = 10000
): (() => void) => {
  let lastStatus: boolean | null = null;
  let isMonitoring = true;
  
  const check = async () => {
    if (!isMonitoring) return;
    
    const status = await checkBackendConnection();
    
    // Only call callback if status changed
    if (lastStatus !== status.isConnected) {
      lastStatus = status.isConnected;
      onStatusChange(status);
    }
    
    // Schedule next check
    if (isMonitoring) {
      setTimeout(check, interval);
    }
  };
  
  // Start monitoring
  check();
  
  // Return stop function
  return () => {
    isMonitoring = false;
  };
};
