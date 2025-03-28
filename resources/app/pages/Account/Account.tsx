"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Helmet } from "react-helmet"
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { AccountClient, type UserProfile } from "@/lib/accountClient"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import AppSidebar from "@/layouts/app-sidebar"
import { AlertCircle, ImageIcon, Loader2, Trash2, Upload, User, X } from "lucide-react"

// Define schemas for form validation
const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  description: z.string().max(500, { message: "Description must be less than 500 characters." }).optional().nullable(),
})

const passwordFormSchema = z
  .object({
    current_password: z.string().min(1, { message: "Current password is required" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    password_confirmation: z.string().min(1, { message: "Please confirm your password." }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  })

const deleteAccountSchema = z.object({
  password: z.string().min(1, { message: "Password is required to delete your account." }),
  confirmation: z.string().refine((val) => val === "DELETE", {
    message: "Please type DELETE to confirm",
  }),
})

// Define types
type ProfileFormValues = z.infer<typeof profileFormSchema>
type PasswordFormValues = z.infer<typeof passwordFormSchema>
type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>

interface WindowWithSSR extends Window {
  ssr?: {
    props?: {
      user?: UserProfile
    }
  }
}

declare const window: WindowWithSSR

export default function Account() {
  const navigate = useNavigate()

  // State
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // File input refs
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  // Preview states
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)

  // Get user from SSR data initially
  const [profile, setProfile] = useState<UserProfile>(() => {
    if (typeof window !== "undefined" && window.ssr?.props?.user) {
      return window.ssr.props.user
    }
    return {
      id: 0,
      name: "",
      email: "",
      avatar: null,
      banner: null,
      description: null,
      google_id: false,
      last_seen: new Date().toISOString(),
    }
  })

  // Set up forms with react-hook-form + zod
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile.name || "",
      email: profile.email || "",
      description: profile.description || "",
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  })

  const deleteAccountForm = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: "",
      confirmation: "",
    },
  })

  // Update form defaults when profile changes
  useEffect(() => {
    profileForm.reset({
      name: profile.name || "",
      email: profile.email || "",
      description: profile.description || "",
    })
  }, [profile, profileForm])

  // Load user profile on mount (to ensure latest data)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await AccountClient.getProfile()
        if (response.success && response.data) {
          setProfile(response.data)
          profileForm.reset({
            name: response.data.name,
            email: response.data.email,
            description: response.data.description || "",
          })
        }
      } catch (error) {
        toast.error("Failed to load profile information")
      } finally {
        setIsLoading(false)
      }
    }

    // Only fetch if we don't have complete data from SSR
    if (!profile.id) {
      setIsLoading(true)
      fetchProfile()
    }
  }, [profileForm])

  // Handle avatar change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()

      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarPreview(event.target.result as string)
        }
      }

      reader.readAsDataURL(file)
    }
  }

  // Handle banner change
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()

      reader.onload = (event) => {
        if (event.target?.result) {
          setBannerPreview(event.target.result as string)
        }
      }

      reader.readAsDataURL(file)
    }
  }

  // Handle profile form submission
  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append("name", data.name)
      formDataObj.append("email", data.email)

      if (data.description !== undefined) {
        formDataObj.append("description", data.description || "")
      }

      // Add avatar file if selected
      if (avatarInputRef.current?.files && avatarInputRef.current.files[0]) {
        formDataObj.append("avatar", avatarInputRef.current.files[0])
      }

      // Add banner file if selected
      if (bannerInputRef.current?.files && bannerInputRef.current.files[0]) {
        formDataObj.append("banner", bannerInputRef.current.files[0])
      }

      const response = await AccountClient.updateProfile(formDataObj)

      if (response.success && response.data) {
        setProfile(response.data)
        setAvatarPreview(null)
        setBannerPreview(null)

        // Reset file inputs
        if (avatarInputRef.current) {
          avatarInputRef.current.value = ""
        }
        if (bannerInputRef.current) {
          bannerInputRef.current.value = ""
        }

        toast.success("Profile updated successfully")
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        // Display validation errors
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          const message = Array.isArray(messages) ? messages[0] : messages
          toast.error(`${field}: ${message}`)
        })
      } else {
        toast.error("Failed to update profile")
      }
    } finally {
      setIsSaving(false)
    }
  }

  // Handle password update
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsChangingPassword(true)

    try {
      const response = await AccountClient.updatePassword(data)

      if (response.success) {
        passwordForm.reset()
        toast.success("Password updated successfully")
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        // Display validation errors
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          const message = Array.isArray(messages) ? messages[0] : messages
          toast.error(`${field}: ${message}`)
        })
      } else {
        toast.error("Failed to update password")
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Handle remove avatar
  const handleRemoveAvatar = async () => {
    try {
      const response = await AccountClient.removeAvatar()

      if (response.success && response.data) {
        setProfile(response.data)
        setAvatarPreview(null)
        if (avatarInputRef.current) {
          avatarInputRef.current.value = ""
        }
        toast.success("Avatar removed successfully")
      }
    } catch (error) {
      toast.error("Failed to remove avatar")
    }
  }

  // Handle remove banner
  const handleRemoveBanner = async () => {
    try {
      const response = await AccountClient.removeBanner()

      if (response.success && response.data) {
        setProfile(response.data)
        setBannerPreview(null)
        if (bannerInputRef.current) {
          bannerInputRef.current.value = ""
        }
        toast.success("Banner removed successfully")
      }
    } catch (error) {
      toast.error("Failed to remove banner")
    }
  }

  // Handle account deletion
  const onDeleteSubmit = async (data: DeleteAccountFormValues) => {
    setIsDeleting(true)

    try {
      const response = await AccountClient.deleteAccount({
        password: data.password,
      })

      if (response.success) {
        toast.success("Your account has been successfully deleted")
        navigate("/auth/login")
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        // Display validation errors
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          const message = Array.isArray(messages) ? messages[0] : messages
          toast.error(`${field}: ${message}`)
        })
      } else {
        toast.error("Failed to delete account")
      }
    } finally {
      setIsDeleting(false)
    }
  }

  // Process image URL
  const getImageUrl = (path: string | null): string | null => {
    if (!path) return null
    return path.startsWith("http") ? path : `/storage/${path}`
  }

  return (
    <AppSidebar header="Account Settings">
      <Helmet>
        <title>Account Settings | Your App Name</title>
      </Helmet>

      <div className="container max-w-4xl items-start py-8">
        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
            {/* Banner section */}
            <Card className="mb-8 overflow-hidden border-0 shadow-sm">
              <div className="relative h-48 w-full bg-muted">
                {(profile.banner || bannerPreview) && (
                  <div className="absolute inset-0">
                    <img
                      src={bannerPreview || getImageUrl(profile.banner)!}
                      alt="Profile banner"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
                  </div>
                )}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <input
                    ref={bannerInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleBannerChange}
                    disabled={isSaving}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="bg-background/80 backdrop-blur-sm"
                    onClick={() => bannerInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {profile.banner ? "Change Banner" : "Add Banner"}
                  </Button>

                  {(profile.banner || bannerPreview) && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="bg-background/80 backdrop-blur-sm text-destructive hover:text-destructive"
                      onClick={handleRemoveBanner}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Profile card */}
            <Card className="mb-8 border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Manage your account profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="w-32 h-32 border-2 border-muted">
                      {profile.avatar || avatarPreview ? (
                        <AvatarImage src={avatarPreview || getImageUrl(profile.avatar)!} alt={profile.name} />
                      ) : (
                        <AvatarFallback className="bg-muted">
                          <User className="h-12 w-12 text-muted-foreground" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex flex-col gap-2">
                      <input
                        ref={avatarInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        disabled={isSaving}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => avatarInputRef.current?.click()}>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Change Avatar
                      </Button>

                      {(profile.avatar || avatarPreview) && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={handleRemoveAvatar}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Avatar
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isSaving} className="bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              disabled={isSaving || profile.google_id}
                              className="bg-background"
                            />
                          </FormControl>
                          {profile.google_id && (
                            <FormMessage>Email cannot be changed for Google-linked accounts</FormMessage>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Tell us a little about yourself"
                              disabled={isSaving}
                              className="resize-none bg-background"
                              rows={4}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">{field.value?.length || 0}/500 characters</p>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>

        {/* Security section */}
        {!profile.google_id && (
          <Card className="mb-8 border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="current_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" disabled={isChangingPassword} className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" disabled={isChangingPassword} className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="password_confirmation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" disabled={isChangingPassword} className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Danger Zone */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b border-muted">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <CardTitle>Danger Zone</CardTitle>
                <CardDescription>Actions in this section cannot be undone</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="rounded-md border border-destructive/20 p-5">
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-base font-medium">Delete Your Account</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Once you delete your account, all of your data will be permanently removed.
                  </p>
                </div>

                <div className="flex justify-end">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-destructive" />
                          Delete Account
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account and all associated
                          data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <Form {...deleteAccountForm}>
                        <form onSubmit={deleteAccountForm.handleSubmit(onDeleteSubmit)} className="space-y-4 py-4">
                          {!profile.google_id && (
                            <FormField
                              control={deleteAccountForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="password"
                                      disabled={isDeleting}
                                      required
                                      className="bg-background"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          <FormField
                            control={deleteAccountForm.control}
                            name="confirmation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Type <span className="font-semibold">DELETE</span> to confirm
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    disabled={isDeleting}
                                    required
                                    placeholder="DELETE"
                                    className="bg-background"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <AlertDialogFooter className="gap-2 pt-2">
                            <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
                            <AlertDialogAction asChild>
                              <Button type="submit" variant="destructive" disabled={isDeleting}>
                                {isDeleting ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Account
                                  </>
                                )}
                              </Button>
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </form>
                      </Form>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppSidebar>
  )
}

