/**
 * QuickDB Modal System
 * Provides confirmation dialogs with light/dark theme support using Tailwind CSS
 */

/**
 * Shows a confirmation modal with light/dark mode support
 * @param {Object} options - Modal configuration options
 * @param {string} options.title - Modal title
 * @param {string} options.message - Modal message
 * @param {string} options.confirmText - Text for confirm button
 * @param {string} options.cancelText - Text for cancel button 
 * @param {string} options.confirmType - Type of confirmation ('delete', 'warning', 'info')
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false if canceled
 */
export function showModal({
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmType = 'delete'
} = {}) {
  return new Promise((resolve) => {
    // Check if dark mode is enabled
    const isDarkMode = document.documentElement.classList.contains('dark') || 
                       document.body.classList.contains('dark') ||
                       window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] font-sans';
    
    
    // Create buttons with unique IDs for reliable selection
    const cancelButtonId = `quickdb-cancel-${Date.now()}`;
    const confirmButtonId = `quickdb-confirm-${Date.now()}`;
    
    // Create modal content
    modal.innerHTML = `
      <div class="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-6 rounded-xl max-w-md w-[90%] shadow-xl">
        <h3 class="text-xl font-semibold mb-4">${title}</h3>
        <p class="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">${message}</p>
        <div class="flex gap-3 justify-end">
          <button id="${cancelButtonId}" class="px-4 py-2.5 rounded-lg cursor-pointer font-medium text-sm transition-colors border-0 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-zinc-200 focus:ring-zinc-500">${cancelText}</button>
          <button id="${confirmButtonId}" class="px-4 py-2.5 rounded-lg cursor-pointer font-medium text-sm transition-colors border-0 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            confirmType === 'delete' ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500' :
            confirmType === 'warning' ? 'bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-500' : 
            confirmType === 'info' ? 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500' : 
            'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-zinc-200 focus:ring-zinc-500'
          }">${confirmText}</button>
        </div>
      </div>
    `;
    
    // Add to DOM
    document.body.appendChild(modal);
    
    // Focus the confirm button
    const confirmButton = document.getElementById(confirmButtonId);
    if (confirmButton) {
      confirmButton.focus();
    }
    
    // Cleanup function
    const cleanup = () => {
      document.body.removeChild(modal);
    };
    
    // Add event listeners
    document.getElementById(cancelButtonId)?.addEventListener('click', () => {
      cleanup();
      resolve(false);
    });
    
    document.getElementById(confirmButtonId)?.addEventListener('click', () => {
      cleanup();
      resolve(true);
    });
    
    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        cleanup();
        resolve(false);
      }
    });
    
    // Add keyboard support
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        cleanup();
        resolve(false);
        window.removeEventListener('keydown', handleKeydown);
      } else if (e.key === 'Enter') {
        cleanup();
        resolve(true);
        window.removeEventListener('keydown', handleKeydown);
      }
    };
    
    window.addEventListener('keydown', handleKeydown);
  });
}

export default showModal;