import HttpClient from '@/lib/Http';

type DataValue = string | number | boolean | object | null | Array<any>;

/**
 * Link - Client-side data synchronization with server
 * Allows sending data to the server for SSR state changes
 */
class Link {
  private static baseUrl = '/api';
  private static autoReload = true; // Flag to control auto-reloading

  /**
   * Change server-side data state by adding new data
   * @param data The data to store on the server
   * @param forceRefresh Force page refresh regardless of autoReload setting
   * @returns Promise with the response data
   */
  static async change(data: DataValue, forceRefresh?: boolean): Promise<any> {
    try {
      // The controller expects an 'add' parameter
      const params = { add: typeof data === 'object' ? JSON.stringify(data) : String(data) };

      // Send request using HttpClient
      const response = await HttpClient.get(`${this.baseUrl}/data-change`, { params });

      console.info('%c Link Data Sync ', 
        'background: #3b82f6; color: white; font-weight: bold;',
        '\nData synchronized successfully'
      );

      // Perform page reload if enabled or forced
      if (forceRefresh === true || (this.autoReload && forceRefresh !== false)) {
        this.reloadPage();
      }

      return response;
    } catch (error) {
      console.error('Failed to sync data with server', error);
      throw new Error('Data synchronization failed');
    }
  }

  /**
   * Clear server-side data
   * @param forceRefresh Force page refresh regardless of autoReload setting
   * @returns Promise with the response data
   */
  static async clear(forceRefresh?: boolean): Promise<any> {
    try {
      const response = await HttpClient.get(`${this.baseUrl}/data-clear`);

      console.info('%c Link Data Clear ', 
        'background: #ef4444; color: white; font-weight: bold;',
        '\nAll data cleared',
        `Performing ${forceRefresh ? 'Reloading page...' : ''}`
      );

      // Perform page reload if enabled or forced
      if (forceRefresh === true || (this.autoReload && forceRefresh !== false)) {
        this.reloadPage();
      }

      return response;
    } catch (error) {
      console.error('Failed to clear data on server', error);
      throw new Error('Data clear operation failed');
    }
  }

  /**
   * Reload the current page to get fresh server-side data
   * @param delay Optional delay in milliseconds before reloading
   */
  static reloadPage(delay: number = 100): void {
    localStorage.setItem('pageReloaded', 'true');
    console.info('%c Page Reload to refresh data ', 
      'background: #8b5cf6; color: white; font-weight: bold;',
      '\nReloading page to refresh data...'
    );
    
    // Store scroll position
    const scrollPos = {
      x: window.scrollX,
      y: window.scrollY
    };
    
    // Save scroll position in sessionStorage
    sessionStorage.setItem('__link_scroll_position', JSON.stringify(scrollPos));
    
    // Add timestamp to URL to prevent caching
    const url = new URL(window.location.href);
    url.searchParams.set('_t', Date.now().toString());
    
    // Delayed reload to ensure API operations complete
    setTimeout(() => {
      window.location.href = url.toString();
    }, delay);
  }

  /**
   * Restore scroll position after page reload
   * Should be called on page load
   */
  static restoreScrollPosition(): void {
    try {
      const storedPos = sessionStorage.getItem('__link_scroll_position');
      if (storedPos) {
        const { x, y } = JSON.parse(storedPos);
        window.scrollTo(x, y);
        sessionStorage.removeItem('__link_scroll_position');
       
        
      }
    } catch (err) {
      console.error('Failed to restore scroll position', err);
    }
  }

  /**
   * Enable or disable automatic page reload after data changes
   * @param enable Whether to enable auto-reloading (default: true)
   */
  static setAutoReload(enable: boolean = true): void {
    this.autoReload = enable;
  }

  /**
   * Set the base URL for API requests
   * @param url New base URL
   */
  static setBaseUrl(url: string): void {
    this.baseUrl = url;
  }
}

export default Link;