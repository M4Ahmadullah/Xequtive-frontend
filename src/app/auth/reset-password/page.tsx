"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authService } from "@/lib/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define form schema with validation
const formSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Validate token
  useEffect(() => {
    const validateToken = () => {
      if (!token) {
        setTokenError(
          "Missing reset token. Please use the link from your email."
        );
        return;
      }

      // This is a simplified token validation - in a real app, you'd verify the token on the server
      // Here we're just checking if it looks like a token (proper length and format)
      if (token.length < 20) {
        setTokenError(
          "Invalid reset token. Please request a new password reset link."
        );
        return;
      }

      setIsTokenValid(true);
    };

    validateToken();
  }, [token]);

  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    if (!token) {
      setError("Missing reset token. Please use the link from your email.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setSuccessMessage("");

    try {
      // Additional client-side validation
      if (data.password !== data.confirmPassword) {
        form.setError("confirmPassword", {
          type: "manual",
          message: "Passwords do not match",
        });
        setError("Passwords do not match. Please check both password fields.");
        setIsLoading(false);
        return;
      }

      try {
        // Use auth service to reset password
        const response = await authService.resetPassword(
          token,
          data.password,
          data.confirmPassword
        );

        if (!response.success) {
          // Format error message for display
          let errorMessage = response.error?.message || "Password reset failed";

          // Map API error codes to user-friendly messages
          const errorCodeMap: Record<string, string> = {
            INVALID_TOKEN:
              "The reset link is invalid or has expired. Please request a new password reset link.",
            EXPIRED_TOKEN:
              "The reset link has expired. Please request a new password reset link.",
            WEAK_PASSWORD:
              "Password is too weak. It must be at least 8 characters with uppercase, lowercase and numbers.",
            PASSWORD_MISMATCH:
              "Passwords do not match. Please check both password fields.",
            USER_NOT_FOUND:
              "User account not found. The reset link may be invalid.",
            USER_DISABLED:
              "This account has been disabled. Please contact support for assistance.",
            TOO_MANY_REQUESTS: "Too many requests. Please try again later.",
            SERVER_ERROR:
              "Our services are temporarily unavailable. Please try again later.",
            NETWORK_ERROR:
              "Network error. Please check your internet connection and try again.",
          };

          // Check for specific error codes first
          const errorCode = errorMessage.toUpperCase().replace(/[^A-Z_]/g, "_");
          if (errorCodeMap[errorCode]) {
            errorMessage = errorCodeMap[errorCode];

            // Set form-specific errors based on the error code
            if (errorCode === "WEAK_PASSWORD") {
              form.setError("password", {
                type: "manual",
                message: "Password is too weak",
              });
            } else if (errorCode === "PASSWORD_MISMATCH") {
              form.setError("confirmPassword", {
                type: "manual",
                message: "Passwords do not match",
              });
            }
          }
          // If no exact match, try to match parts of the error message
          else if (
            errorMessage.toLowerCase().includes("token") &&
            (errorMessage.toLowerCase().includes("invalid") ||
              errorMessage.toLowerCase().includes("expired") ||
              errorMessage.toLowerCase().includes("used"))
          ) {
            errorMessage =
              "The reset link is invalid or has expired. Please request a new password reset link.";
          } else if (errorMessage.toLowerCase().includes("password")) {
            if (errorMessage.toLowerCase().includes("weak")) {
              form.setError("password", {
                type: "manual",
                message:
                  "Password is too weak. It must be at least 8 characters with uppercase, lowercase and numbers.",
              });
            } else if (errorMessage.toLowerCase().includes("match")) {
              form.setError("confirmPassword", {
                type: "manual",
                message: "Passwords do not match",
              });
            } else {
              form.setError("password", {
                type: "manual",
                message: errorMessage,
              });
            }
          } else if (
            errorMessage.toLowerCase().includes("network") ||
            errorMessage.toLowerCase().includes("connection") ||
            errorMessage.toLowerCase().includes("offline") ||
            errorMessage.toLowerCase().includes("internet")
          ) {
            errorMessage =
              "Network error. Please check your internet connection and try again.";
          } else if (
            errorMessage.toLowerCase().includes("server") ||
            errorMessage.toLowerCase().includes("unavailable") ||
            errorMessage.toLowerCase().includes("maintenance") ||
            errorMessage.includes("500") ||
            errorMessage.includes("503")
          ) {
            errorMessage =
              "Our services are temporarily unavailable. Please try again later.";
          } else if (
            errorMessage.toLowerCase().includes("too many") ||
            errorMessage.toLowerCase().includes("rate limit") ||
            errorMessage.toLowerCase().includes("try again later")
          ) {
            errorMessage = "Too many requests. Please try again later.";
          }

          setError(errorMessage);
          setIsLoading(false);
          return;
        }

        // Password reset was successful
        setSuccess(true);
        setSuccessMessage(
          "Your password has been reset successfully. You can now sign in with your new password."
        );
        form.reset();
      } catch (networkError) {
        console.error("Network error during password reset:", networkError);
        setError(
          "Unable to connect to our services. Please check your internet connection and try again."
        );
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.error("Password reset error:", err);

      let errorMessage = "An unexpected error occurred. Please try again.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Render the form
  return (
    <div className="flex min-h-screen bg-background flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-md border border-border/30">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Enter your new password to reset your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Token validation error */}
          {tokenError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{tokenError}</AlertDescription>
            </Alert>
          )}

          {/* General error message */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success message */}
          {success && (
            <Alert
              variant="default"
              className="mb-4 bg-green-50 text-green-800"
            >
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Password reset form */}
          {!success && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Password field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            {...field}
                            className="pr-10"
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirm password field */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            {...field}
                            className="pr-10"
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !isTokenValid}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Reset Password
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <Link
            href="/auth/signin"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen bg-background flex-col items-center justify-center p-4">
          <Card className="w-full max-w-md mx-auto shadow-md border border-border/30">
            <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center min-h-[400px]">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-lg font-medium mt-4">
                Loading password reset...
              </p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
