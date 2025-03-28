"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarClock, Clock, Quote } from "lucide-react"
import { getQuote } from "@/lib/getQoute"

// Define interface for user data
interface UserData {
  id: number
  name: string
  email: string
  avatar: string | null
  last_seen: string
  rank?: string
  google_id?: boolean
}

const AdBanner = () => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Create first script element that sets the configuration options
    const script1 = document.createElement('script');
    script1.type = 'text/javascript';
    script1.text = `
      atOptions = {
        'key' : '7a6f3fb740ba622b905d1002527963ba',
        'format' : 'iframe',
        'height' : 60,
        'width' : 468,
        'params' : {}
      };
    `;
    
    // Create second script element that loads the ad
    const script2 = document.createElement('script');
    script2.type = 'text/javascript';
    script2.src = '//www.highperformanceformat.com/7a6f3fb740ba622b905d1002527963ba/invoke.js';
    
    // Add scripts to DOM
    if (adContainerRef.current) {
      adContainerRef.current.appendChild(script1);
      adContainerRef.current.appendChild(script2);
    }
    
    // Cleanup when component unmounts
    return () => {
      if (adContainerRef.current) {
        if (script1.parentNode === adContainerRef.current) {
          adContainerRef.current.removeChild(script1);
        }
        if (script2.parentNode === adContainerRef.current) {
          adContainerRef.current.removeChild(script2);
        }
      }
    };
  }, []);
  
  return <div ref={adContainerRef} className="mt-0 flex justify-center"></div>;
};

export const DashboardCard = () => {
  // Get user data from SSR props
  const [user, setUser] = useState<UserData>(() => {
    if (typeof window !== 'undefined' && window.ssr?.props?.user) {
      return window.ssr.props.user;
    }
    return {
      id: 0,
      name: 'Guest',
      email: '',
      avatar: null,
      last_seen: new Date().toISOString(),
    };
  });

  // Get quote data
  const [quote, setQuote] = useState<{ quote: string; author: string } | null>(() => {
    return getQuote();
  });

  const [currentTime, setCurrentTime] = useState<string>("")

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      )
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Format the last seen date
  const formatLastSeen = (dateString: string) => {
    if (!dateString) return "Never"

    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes} minutes ago`
    if (hours < 24) return `${hours} hours ago`
    if (days === 1) return "Yesterday"

    return date.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Generate a random background image URL
  const backgroundImageUrl = "https://picsum.photos/1920/1080?random=" + user.id;

  return (
    <>
    <Card className="w-full mb-6 overflow-hidden rounded-lg border-0" style={{
      backgroundImage: `url(${backgroundImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <CardContent className="p-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative h-[200px] w-full rounded-lg overflow-hidden"
        >
          {/* Background with gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-black/50 rounded-lg" />
          
          <div className="absolute inset-0 p-6">
            <div className="h-full flex flex-col justify-between">
              {/* Top row with time and last seen */}
              <div className="flex justify-between items-start w-full text-white/90">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full"
                >
                  <Clock className="h-4 w-4" />
                  <span className="font-medium tabular-nums">{currentTime}</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full"
                >
                  <CalendarClock className="h-4 w-4" />
                  <span>Last seen: {formatLastSeen(user.last_seen)}</span>
                </motion.div>
              </div>

              {/* Middle section with user info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-4"
              >
                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                  <Avatar className="h-16 w-16 rounded-full ring-2 ring-white/20">
                    <AvatarImage 
                      src={user.avatar ? 
                        (user.avatar.startsWith('http') ? user.avatar : `/storage/${user.avatar}`) 
                        : undefined
                      } 
                      alt={user.name} 
                    />
                    <AvatarFallback className="bg-primary/20 text-white text-lg">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>

                <div className="flex-1">
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-2xl font-bold text-white"
                  >
                    Welcome back, {user.name}!
                  </motion.h1>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center gap-2 mt-1"
                  >
                    {user.rank && (
                      <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-white/90">Rank: {user.rank}</span>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Quote section */}
                {quote && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                    className="max-w-md bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg"
                  >
                    <div className="flex items-start gap-2">
                      <Quote className="h-4 w-4 text-white/60 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-white/90 text-sm italic">"{quote.quote}"</p>
                        <p className="text-white/60 text-xs mt-1">― {quote.author}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
    <AdBanner/>
    </>
  )
}