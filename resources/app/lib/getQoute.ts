/**
 * Gets the inspiring quote from server-side rendered data
 * @returns {string | null} The inspiring quote or null if not available
 */

// Declare the structure of the quote data
interface QuoteData {
    quote: string;
    author: string;
  }
  
  // Extend the Window interface to include our custom properties
  declare module globalThis {
    interface Window {
      ssr: {
        props: Record<string, any>;
        inspire?: QuoteData;
      };
      inspire?: any;
      PterodactylUser?: any;
      SiteConfiguration?: any;
    }
  }

    
export const getQuote = (): string | null => {
    // Try to get quote from window.ssr.inspire first (direct access)
    if (typeof window !== 'undefined' && window.ssr && window.ssr.inspire) {
      return window.ssr.inspire;
    }
    
    // Fallback to window.inspire if available
    if (typeof window !== 'undefined' && window.inspire) {
      return window.inspire;
    }
    
    // Return null if no quote is available
    return null;
  };
  
  /**
   * Gets a random quote if server-side quote is not available
   * @returns {string} An inspiring quote
   */
  export const getRandomQuote = (): string => {
    const quote = getQuote();
    
    if (quote) {
      return quote;
    }
    
    // Fallback quotes if server-side quote is not available
    const fallbackQuotes = [
      "The only way to do great work is to love what you do. - Steve Jobs",
      "It does not matter how slowly you go as long as you do not stop. - Confucius",
      "Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston Churchill",
      "Believe you can and you're halfway there. - Theodore Roosevelt",
      "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt"
    ];
    
    return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  };
  
  export default getQuote;