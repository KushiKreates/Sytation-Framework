import { useState, useEffect } from 'react';
import SSRData from '@/lib/SSR-data';

/**
 * React hook to easily access SSR data
 * @param key - Optional specific prop key to retrieve
 * @param defaultValue - Default value if the key is not found
 */
export function useSSRData<T = any>(key?: string, defaultValue?: T) {
  const [value, setValue] = useState<T | Record<string, any>>(
    key ? SSRData.get(key, defaultValue) : SSRData.all
  );

  useEffect(() => {
    // Update state if SSR data changes (unlikely but possible with HMR)
    if (key) {
      setValue(SSRData.get(key, defaultValue));
    } else {
      setValue(SSRData.all);
    }
  }, [key, defaultValue]);

  return value;
}

/**
 * React hook for accessing flash messages
 */
export function useFlash() {
  return SSRData.flash;
}

/**
 * React hook for accessing validation errors
 * @param field - Optional specific field to get errors for
 */
export function useErrors(field?: string) {
  if (field) {
    return SSRData.getError(field);
  }
  
  return {
    all: SSRData.errors,
    has: SSRData.hasErrors(),
    get: SSRData.getError
  };
}

export default useSSRData;