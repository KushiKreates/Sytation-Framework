import React, { useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, CreditCard, DollarSign, LucideFileArchive, LucideTransgender, LucideTrash2, User, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import QuickDB from '@/lib/quickDB';

import SSRData from "@/lib/SSR-data";
import AppSidebar from "@/layouts/app-sidebar";
import axios from 'axios';
import { getRandomQuote } from "@/lib/getQoute";
import { DashboardCard } from "@/elements/Dashboard/Dashboard-card";
import { Input } from "@/components/ui/input";
import { set } from "react-hook-form";
import Link from "@/lib/Link";


interface ContentItem {
  id: string;
  text: string;
  timestamp: number;
}

// Initialize User instance outside component
if (!QuickDB.User) {
  QuickDB.User = QuickDB.createInstance('User'); // Encrypted Database for Client Side
}



const ContentInput = () => {
  const [text, setText] = useState('');
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = QuickDB.User?.get('content') || [];
      setContents(stored);
    } catch (err) {
      setError('Failed to load content');
      console.error(err);
    }
  }, []);

  const addContent = () => {
    if (!text.trim()) return;
    
    try {
      const newItem: ContentItem = {
        id: crypto.randomUUID(),
        text: text.trim(),
        timestamp: Date.now()
      };
      
      const updatedContents = [...contents, newItem];
      QuickDB.User?.set('content', updatedContents, 'Create');
      setContents(updatedContents);
      setText('');
    } catch (err) {
      setError('Failed to add content');
      console.error(err);
    }
  };

  const deleteItem = (id: string) => {
    try {
      const updatedContents = contents.filter(item => item.id !== id);
      QuickDB.User?.set('content', updatedContents);
      setContents(updatedContents);
    } catch (err) {
      setError('Failed to delete content');
      console.error(err);
    }
  };

  

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Add Content</CardTitle>
        <CardDescription>Store new content in QuickDB</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your content..."
          />
          <Button onClick={addContent}>Add</Button>
        </div>
        <div className="space-y-4">
          {contents.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <div className="flex items-center gap-4">
                <div className="mt-0.5 rounded-full bg-zinc-100 p-1.5 dark:bg-zinc-800">
                  <LucideFileArchive className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{item.text}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteItem(item.id)}
              >
                <LucideTrash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const why = await QuickDB.User?.delete();
              if (why === true) {
                console.log("Deleted");
                setContents([]);
              }
            }}
          >
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  const [user, setUser] = useState<any | null>(null);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testApiProgress = async () => {
    setLoading(true);
    setApiResponse(null);
    
    try {
      // Using a random delay API for testing progress bar
      const response = await axios.get('https://httpbin.org/delay/0.43');
      setApiResponse('API call successful!');
    } catch (error) {
      setApiResponse('API call failed.');
    } finally {
      setLoading(false);
    }
  };

  const ssrPost = async () => {
    setLoading(true);
    setApiResponse(null);
    
    try {
      // Always refresh regardless of autoReload setting
      Link.change("Hello, world", true);

      // Never refresh regardless of autoReload setting
      //Link.change("Hello, world", false);


      setApiResponse('API call successful!');
    } catch (error) {
      setApiResponse('API call failed.');
    } finally {
      setLoading(false);
    }
  };

  const ssrClear = async () => {
    setLoading(true);
    setApiResponse(null);
    
    try {
      
      Link.clear();

      setApiResponse('API call successful!');
    } catch (error) {
      setApiResponse('API call failed.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Get user data from SSRData
    const userData = SSRData.get<any>("user");

    if (userData) {
      setUser(userData);
      console.log("Dashboard: User found:", userData);
    }
  }, []);

  

  return (
    <AppSidebar header="Dashboard" sidebartab="dashboard" >
      <div className="flex flex-col gap-5">
        
        <DashboardCard/>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Subscriptions
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2350</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12,234</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Now
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">
                +201 since last hour
              </p>
            </CardContent>
          </Card>
          
        </div>

        {/* Main Content Area */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Overview Card */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>
                A summary of your account activity and status.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Project Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Project Completion</span>
                  <span className="text-sm font-medium">65%</span>
                </div>
                <Progress value={65} className="h-2" />
              </div>
              
              {/* Storage Usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Storage Usage</span>
                  <span className="text-sm font-medium">48%</span>
                </div>
                <Progress value={48} className="h-2" />
              </div>
              
              {/* API Requests */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Requests (monthly)</span>
                  <span className="text-sm font-medium">32%</span>
                </div>
                <Progress value={32} className="h-2" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">
                View Full Report
              </Button>
            </CardFooter>
          </Card>

          <Button onClick={testApiProgress} disabled={loading}>
            {loading ? 'Loading...' : 'Test API Progress'}
          </Button>

          <Button onClick={ssrPost} disabled={loading}>
            {loading ? 'Loading...' : 'Dynamic Data populate'}
          </Button>

          <Button onClick={ssrClear} disabled={loading}>
            {loading ? 'Loading...' : 'SSR dynamic data clear'}
          </Button>
          

          {apiResponse && (
          <div className="mt-6 p-4 bg-card rounded-md">
            <p className="text-foreground">{apiResponse}</p>
          </div>
        )}

          {/* Recent Activity Card */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest account activities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-4 rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <div className="mt-0.5 rounded-full bg-zinc-100 p-1.5 dark:bg-zinc-800">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Project {i} update</p>
                      <p className="text-sm text-muted-foreground">
                        {i === 1 ? "Just now" : `${i * 2} hours ago`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full">
                View All Activities
              </Button>
            </CardFooter>
          </Card>
          <ContentInput/>
        </div>
      </div>
    </AppSidebar>
  );
}