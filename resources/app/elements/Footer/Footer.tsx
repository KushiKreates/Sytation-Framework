
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://images.dmca.com/Badges/DMCABadgeHelper.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-theme(spacing.16))] sticky">
      <div className="pb-[10px]">
        {/* Main content wrapper */}
      </div>
      <footer className="absolute bottom-0 left-0 right-0 w-full py-6 px-4 bg-white dark:bg-black rounded-lg transition-colors duration-200">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Copyright © {new Date().getFullYear()} Nadhi.dev
            </p>
            <div className="flex items-center space-x-4">
              
              
            </div>
            
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-2 md:mt-0">
            ©️ Web Technologies and Frontend by Nadhila Alokabandara. Courses and Resources by Savith Ratnaweera & <b><a href='/team'> Other collaborators </a></b>
          </p>
          </div>
          <div className="mt-4">
            <a
              href="//www.dmca.com/Protection/Status.aspx?ID=8325d56a-0fde-46d4-b3c7-e00fd57859ff"
              title="DMCA.com Protection Status"
              className="dmca-badge"
            >
             
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
