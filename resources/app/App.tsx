import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import ErrorBoundary from './elements/Errors/ErrorBoundary';
import ProgressBar from './elements/Progress/ProgressBar';


import QuickDB from './lib/quickDB';
import { Toaster } from 'react-hot-toast';
import ToastNotifications from './components/ToastNotifications';
import Link from './lib/Link';

function App() {
    useEffect(() => {
        // Initialize User instance if not already initialized
        if (!QuickDB.User) {
            QuickDB.User = QuickDB.createInstance('User', true);
        }

       
        
        // Function to sync user data from SSR to QuickDB N ETC
        const syncUserData = () => {
            try {
                if (window.ssr?.props?.user) {
                    // Store user data in QuickDB
                    QuickDB.User.set('auth', window.ssr.props.user);
                    
                    console.info('%c QuickDB User Sync ', 
                        'background: #4CAF50; color: white; font-weight: bold;',
                        '\nUser data synchronized'
                    );
                    if (localStorage.getItem('pageReloaded')) {
                        localStorage.removeItem('pageReloaded');
                        console.warn(
                            '%c ⚠️ Page Reload Warning ⚠️ ',
                            'background: #FFA500; color: black; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
                            '\n\nThis page was automatically reloaded to refresh server data.' +
                            '\n\nTo disable automatic reloads, use either:' +
                            '\n• Link.change(data, false)' +
                            '\n• Link.clear(false)' +
                            '\n\nAutomatic reloads ensure data consistency but may impact performance.'
                        );
                    }

                } else {
                    // If no user is found, clear auth data
                    QuickDB.User.deleteKey('auth');
                }
            } catch (err) {
                console.error('Failed to sync user data to QuickDB', err);
            }
        };
        
        // Initial sync
        syncUserData();
        
        // Set up MutationObserver to detect when user data might have changed
        const observer = new MutationObserver((mutations) => {
            // Check if window.ssr.props.user has changed
            syncUserData();
        });
        
        // Start observing for changes in the body (this is a simple heuristic)
        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
        
        // Clean up observer on component unmount
        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div className="block relative">
            <ProgressBar/>
            <Toaster position='bottom-right'/>
        
            <ErrorBoundary>
                <RouterProvider
                    router={router}
                />
                <ToastNotifications />
            </ErrorBoundary>
        </div>
    );
}

export default App;