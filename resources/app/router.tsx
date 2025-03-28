import React from 'react';
import { Navigate, Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import RootLayout from "@/layouts/RootLayout";
import RouteLoading from "@/components/RouteLoading";
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

import ErrorBoundary from './elements/Errors/ErrorBoundary';
import routes, { RouteConfig } from './routes';
import Error404 from './pages/404';
//import { AppSidebar } from './layouts/app-sidebar';

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  minimum: 0.1,
  easing: 'ease',
  speed: 500
});

// Function to render a route with ErrorBoundary and Suspense
const renderRouteWithErrorHandling = (route: RouteConfig) => {
  const Component = route.component;
  
  // Check if route requires authentication
  if (route.requiresAuth) {
    // Simple check: if no user in SSR data, redirect to login
    const user = window.ssr?.props?.user || null;
    
    if (!user) {
      // Return a redirect component for unauthenticated users
      return (
        <React.Suspense fallback={<RouteLoading />}>
          <Navigate to="/auth/login" replace />
        </React.Suspense>
      );
    }
  }
  
  // Normal rendering for authenticated users or public routes
  return (
    <React.Suspense 
      fallback={<RouteLoading />}
      onTransition={() => {
        NProgress.start();
        return () => NProgress.done();
      }}
    >
      <ErrorBoundary>
        <Component />
      </ErrorBoundary>
    </React.Suspense>
  );
};

// Create routes recursively
const createRoutesRecursively = (routeConfigs: RouteConfig[]) => {
  return routeConfigs.map((route) => {
    if (route.children) {
      return (
        <Route 
          key={route.path}
          path={route.path} 
          element={route.layout ? <route.layout /> : renderRouteWithErrorHandling(route)}
          loader={() => {
            NProgress.start();
            return null;
          }}
        >
          {createRoutesRecursively(route.children)}
        </Route>
      );
    }
    
    return (
      <Route
        key={route.path}
        path={route.path}
        index={route.exact}
        element={renderRouteWithErrorHandling(route)}
        loader={() => {
          NProgress.start();
          return null;
        }}
      />
    );
  });
};

// Create the router
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      {createRoutesRecursively(routes)}
      <Route
        path="*"
        element={
          <ErrorBoundary>
            <Error404 />
          </ErrorBoundary>
        }
      />
    </Route>
  )
);

// Add navigation event listeners to manage progress bar
router.subscribe((state) => {
  if (state.navigation.state === 'loading') {
    NProgress.start();
  }
  if (state.navigation.state === 'idle') {
    NProgress.done();
  }
});

export default router;