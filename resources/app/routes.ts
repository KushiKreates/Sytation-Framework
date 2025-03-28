import React from 'react';

export interface RouteConfig {
  path: string;
  component: any;
  children?: RouteConfig[];
  layout?: React.ComponentType<any>;
  requiresAuth?: boolean;
  exact?: boolean;
}

// Define your routes in this configuration
const routes: RouteConfig[] = [
  {
    path: '/',
    component: React.lazy(() => import('@/pages/Welcome')),
    exact: true,
    requiresAuth: false 
  },
  {
    path: '/auth/login',
    component: React.lazy(() => import('@/pages/Login')),
    requiresAuth: false 
  },
  {
    path: '/auth/register',
    component: React.lazy(() => import('@/pages/Register')),
    requiresAuth: false 
  },
  {
    path: '/testing',
    component: React.lazy(() => import('@/pages/Welcome')),
    requiresAuth: true 
  },
  {
    path: '/dashboard',
    component: React.lazy(() => import('@/pages/Dashboard')), // Make sure capitalization matches your file name
    requiresAuth: true 
  },
  {
    path: '/account',
    component: React.lazy(() => import('@/pages/Account/Account')), // Make sure capitalization matches your file name
    requiresAuth: true 
  },
];

export default routes;