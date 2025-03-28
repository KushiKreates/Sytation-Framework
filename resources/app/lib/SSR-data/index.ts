type SSRData = {
  props: Record<string, any>;
  flash: Record<string, any>;
  errors: Record<string, any>;
  csrf: string;
};

// Define the global window type with our SSR property
declare global {
  interface Window {
    ssr: SSRData;
  }
}

/**
 * SSR data access utility
 * Provides type-safe access to server-rendered data
 */
const SSRData = {
  /**
   * Get all server-side props
   */
  get all() {
    return window.ssr?.props || {};
  },

  /**
   * Get a specific prop by key or all props if no key is provided
   * @param key - Optional prop key to retrieve
   * @param defaultValue - Optional default value if the key doesn't exist
   */
  get<T = any>(key?: string, defaultValue?: T): T | Record<string, any> {
    // If no key is provided, return all props
    if (key === undefined) {
      return window.ssr?.props || {};
    }
    
    // If window.ssr or props doesn't exist, return default value
    if (!window.ssr || !window.ssr.props) {
      return defaultValue as T;
    }
    
    // Return the specific prop or default value
    return window.ssr.props[key] !== undefined 
      ? window.ssr.props[key] 
      : defaultValue as T;
  },

  /**
   * Check if a prop exists
   * @param key - The prop key to check
   */
  has(key: string): boolean {
    return window.ssr?.props && window.ssr.props[key] !== undefined;
  },

  /**
   * Get flash messages
   */
  get flash() {
    return window.ssr?.flash || {};
  },

  /**
   * Get validation errors
   */
  get errors() {
    return window.ssr?.errors || {};
  },

  /**
   * Get CSRF token
   */
  get csrf() {
    return window.ssr?.csrf || '';
  },

  /**
   * Get a specific error by field name
   * @param field - The field name to get errors for
   */
  getError(field: string): string[] {
    return window.ssr?.errors?.[field] || [];
  },

  /**
   * Check if there are any validation errors
   */
  hasErrors(): boolean {
    return Object.keys(window.ssr?.errors || {}).length > 0;
  }
};

export default SSRData;