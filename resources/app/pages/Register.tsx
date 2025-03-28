"use client"

import { useNavigate } from "react-router-dom"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import GoogleLoginButton from "@/elements/auth/GoogleLoginButton"

export default function Register() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen w-full">
      {/* Left side - Image with overlay */}
      <div className="hidden lg:block lg:w-1/2 relative bg-black">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 z-10"></div>
        <img
          src="https://picsum.photos/seed/picsum/1920/1080"
          alt="Linux terminal with code"
          className="w-full h-full "
        />
        <div className="absolute inset-0 flex flex-col justify-center items-start p-12 text-white z-20">
          <h1 className="text-4xl font-bold mb-4 max-w-md">Powerful Development Environment</h1>
          <p className="text-lg opacity-90 max-w-md mb-6">
            Seamlessly integrate your workflow with our powerful tools and services.
          </p>
          <div className="flex space-x-2">
            <div className="h-1 w-12 bg-primary rounded-full"></div>
            <div className="h-1 w-12 bg-white/30 rounded-full"></div>
            <div className="h-1 w-12 bg-white/30 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Right side - Registration form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl ">Register</CardTitle>
              <CardDescription>
                Create a new account using Google authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GoogleLoginButton className="w-full h-12 text-base font-medium" />
              <p className="text-sm text-center text-muted-foreground mt-4">
                Currently limited to certian forms of authentication is supported by this application.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center w-full">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Button variant="link" className="p-0 h-auto font-medium" onClick={() => navigate("/auth/login")}>
                    Sign in
                  </Button>
                </p>
              </div>
            </CardFooter>
          </Card>

          <div className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-xs underline underline-offset-2"
              onClick={() => navigate("/terms")}
            >
              Terms of Service
            </Button>{" "}
            and{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-xs underline underline-offset-2"
              onClick={() => navigate("/privacy")}
            >
              Privacy Policy
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}