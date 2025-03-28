"use client"

import type React from "react"

import { Component } from "react"
import clsx from "clsx"
import { NavLink } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { ParticleButton } from "../buttons/Parctile-Button"
import ToggleThemeSwitch from "../switchs/ToggleThemeSwitch"
import SSRData from "@/lib/SSR-data"
import { Button } from "@/components/ui/button"

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

class ErrorBoundary extends Component<Props, State> {
  private url: string = window.location.pathname

  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  // TyperScript safe data from the Server
  // Sent via controller 
  private data = SSRData.get() as any; 

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(error)
    this.setState({ errorInfo })
  }

  render() {
    if (this.props.fallback && this.state.hasError) {
      return this.props.fallback
    }

    return this.state.hasError ? (
      <div className="fixed inset-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-4">
        <Card className="w-full max-w-4xl shadow-md border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left side with error icon */}
            <div className="bg-zinc-100 dark:bg-zinc-800 p-6 md:p-8 flex flex-col items-center justify-center md:w-1/3">
              {/* Error Icon */}
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="w-8 h-8 text-red-500 dark:text-red-400"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>

              <h1 className="text-xl md:text-2xl font-medium text-center text-zinc-900 dark:text-zinc-100 mb-3">
                Application Error
              </h1>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">An unexpected error has occurred</p>
            </div>

            {/* Right side with error details */}
            <div className="p-6 md:p-8 md:w-2/3 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-700">
              <h2 className="text-base font-medium mb-3 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-red-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 8v4m0 4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" />
                </svg>
                Error Details
              </h2>

              <div className="bg-zinc-50 dark:bg-zinc-800/70 rounded border border-zinc-200 dark:border-zinc-700 p-3 mb-4 max-h-[180px] overflow-auto text-sm font-mono">
                <p className="text-red-600 dark:text-red-400">{this.state.error?.toString() || "Unknown error"}</p>

                {this.state.errorInfo && (
                  <pre className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0m9-3v3m0 3h.01" />
                  </svg>
                  Error Location
                </h3>

                <p className="text-sm bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 rounded border border-zinc-200 dark:border-zinc-700">
                  {this.url}
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0m9-3v3m0 3h.01" />
                  </svg>
                 Server Side Generation
                </h3>

                <div className="text-sm bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 rounded border border-zinc-200 dark:border-zinc-700 max-h-[150px] overflow-auto">
                {this.data && Array.isArray(this.data) ? (
                    <ul className="list-disc pl-5 space-y-1">
                    {this.data.map((item, index) => (
                        <li key={index}>
                        {typeof item === 'object' 
                            ? JSON.stringify(item) 
                            : String(item)}
                        </li>
                    ))}
                    </ul>
                ) : (
                    <p>{JSON.stringify(this.data, null, 2)}</p>
                )}
                </div>

                
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 15h.01M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm4 9h8" />
                  </svg>
                  Troubleshooting Steps
                </h3>

                <ul className="text-sm text-zinc-600 dark:text-zinc-400 list-disc pl-5 space-y-1">
                  <li>Refresh the page</li>
                  <li>Clear your browser cache</li>
                  <li>Return to the dashboard</li>
                  <li>Contact support if the issue persists</li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  className={clsx("rounded-md py-2 px-4 text-white bg-red-600 hover:bg-red-700 dark:bg-red-900  transition-colors")}
                  onClick={() => window.location.reload()}
                >
                  <span className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                      <path d="M3 12a9 9 0 0 0 15 6.7L21 16"></path>
                    </svg>
                    Refresh Page
                  </span>
                </Button>

                <Button
                  className={clsx("rounded-md py-2 px-4 text-white bg-zinc-600 hover:bg-zinc-700 dark:bg-zinc-900 transition-colors")}
                  onClick={() => window.location.assign("/")}
              >
                <NavLink
                  to="/"
                  className="rounded-md py-2 px-4  bg-transparent transition-colors flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  Back to Dashboard
                </NavLink>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Theme switch positioned at bottom right */}
        <div className="fixed bottom-4 right-4 z-20">
          <ToggleThemeSwitch />
        </div>
      </div>
    ) : (
      this.props.children
    )
  }
}

export default ErrorBoundary