"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Image from "next/image";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function SignInForm() {
  const { signIn } = useAuthActions();
  const searchParams = useSearchParams();
  const initialFlow = searchParams.get("flow") === "signUp" ? "signUp" : "signIn";
  const [flow, setFlow] = useState<"signIn" | "signUp">(initialFlow);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState("");
  const router = useRouter();
  
  const verifyManagerPassword = useMutation(api.myFunctions.verifyManagerPassword);
  const createWorkerProfile = useMutation(api.myFunctions.createWorkerProfile);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      if (flow === "signUp") {
        const name = formData.get("name") as string;
        const surname = formData.get("surname") as string;
        const department = formData.get("department") as string;
        const position = formData.get("position") as string;
        const managerPassword = formData.get("managerPassword") as string;

        // Only verify manager password if position is "Manager"
        if (position === "Manager") {
          await verifyManagerPassword({
            password: managerPassword,
            department,
          });
        }

        // Create auth account
        formData.set("flow", "signUp");
        await signIn("password", formData);

        // Create worker profile
        await createWorkerProfile({
          name,
          surname,
          department,
          position,
        });

        router.push("/onboarding");
      } else {
        // Sign in flow
        formData.set("flow", "signIn");
        await signIn("password", formData);
        router.push("/dashboard");
      }
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen justify-center items-center px-4 py-12 bg-background selection:bg-foreground selection:text-background">
      <div className="flex flex-col gap-10 w-full max-w-[480px]">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-6">
          <div className="flex items-center gap-5">
            <Image src="/convex.svg" alt="Convex Logo" width={60} height={60} />
            <div className="w-px h-12 bg-border"></div>
            <Image
              src="/nextjs-icon-light-background.svg"
              alt="Next.js Logo"
              width={60}
              height={60}
              className="dark:hidden"
            />
            <Image
              src="/nextjs-icon-dark-background.svg"
              alt="Next.js Logo"
              width={60}
              height={60}
              className="hidden dark:block"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-foreground">
              {flow === "signIn" ? "Welcome back." : "Create account."}
            </h1>
            <p className="text-lg font-medium text-muted-foreground">
              {flow === "signIn"
                ? "Sign in to access the SP Zoo OS"
                : "Register a new worker profile"}
            </p>
          </div>
        </div>
        
        {/* Form Card */}
        <form
          className="flex flex-col gap-5 w-full bg-card p-8 sm:p-10 rounded-[2.5rem] border border-border shadow-2xl shadow-black/5 dark:shadow-white/5"
          onSubmit={handleSubmit}
        >
          {flow === "signUp" && (
            <>
              <div className="grid grid-cols-2 gap-5">
                <input
                  className="bg-background text-foreground rounded-2xl p-4 border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none transition-all placeholder:text-muted-foreground font-medium"
                  type="text"
                  name="name"
                  placeholder="First Name"
                  required
                />
                <input
                  className="bg-background text-foreground rounded-2xl p-4 border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none transition-all placeholder:text-muted-foreground font-medium"
                  type="text"
                  name="surname"
                  placeholder="Last Name"
                  required
                />
              </div>

              <select
                className="bg-background text-foreground rounded-2xl p-4 border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none transition-all font-medium appearance-none"
                name="department"
                required
              >
                <option value="">Select Department</option>
                <option value="Operations">Operations</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Customer Service">Customer Service</option>
                <option value="Administration">Administration</option>
                <option value="Security">Security</option>
              </select>

              <select
                className="bg-background text-foreground rounded-2xl p-4 border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none transition-all font-medium appearance-none"
                name="position"
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                required
              >
                <option value="">Select Position</option>
                <option value="Manager">Manager</option>
                <option value="Zookeeper">Zookeeper</option>
                <option value="Veterinarian">Veterinarian</option>
                <option value="Maintenance Worker">Maintenance Worker</option>
                <option value="Customer Service Representative">Customer Service Representative</option>
                <option value="Security Guard">Security Guard</option>
                <option value="Animal Trainer">Animal Trainer</option>
                <option value="Nutritionist">Nutritionist</option>
                <option value="Administrative Assistant">Administrative Assistant</option>
              </select>
            </>
          )}

          <input
            className="bg-background text-foreground rounded-2xl p-4 border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none transition-all placeholder:text-muted-foreground font-medium"
            type="email"
            name="email"
            placeholder="Work Email"
            required
          />
          
          <div className="flex flex-col gap-2">
            <input
              className="bg-background text-foreground rounded-2xl p-4 border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none transition-all placeholder:text-muted-foreground font-medium"
              type="password"
              name="password"
              placeholder="Password"
              minLength={8}
              required
            />
            {flow === "signUp" && (
              <p className="text-sm font-medium text-muted-foreground px-2">
                Must be at least 8 characters
              </p>
            )}
          </div>

          {flow === "signUp" && selectedPosition === "Manager" && (
            <div className="flex flex-col gap-2 mt-2">
              <input
                className="bg-background text-foreground rounded-2xl p-4 border border-foreground focus:border-foreground focus:ring-2 focus:ring-foreground outline-none transition-all placeholder:text-muted-foreground font-medium"
                type="password"
                name="managerPassword"
                placeholder="Manager Authorization Password"
                required
              />
              <p className="text-sm font-bold text-foreground px-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                Authorization required
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mt-2">
              <p className="text-red-600 dark:text-red-400 font-bold text-sm tracking-tight break-words">
                {error}
              </p>
            </div>
          )}

          <button
            className="mt-4 w-full bg-foreground text-background font-bold text-lg rounded-2xl py-4 transition-all duration-200 hover:opacity-90 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            type="submit"
            disabled={loading}
          >
            {loading ? "Authenticating..." : flow === "signIn" ? "Sign in to Workspace" : "Create Account"}
          </button>
          
          <div className="mt-4 flex flex-row gap-2 text-base justify-center font-medium">
            <span className="text-muted-foreground">
              {flow === "signIn"
                ? "New to the system?"
                : "Already registered?"}
            </span>
            <span
              className="text-foreground font-bold underline decoration-2 underline-offset-4 hover:text-muted-foreground cursor-pointer transition-colors"
              onClick={() => {
                setFlow(flow === "signIn" ? "signUp" : "signIn");
                setSelectedPosition("");
                setError(null);
              }}
            >
              {flow === "signIn" ? "Sign up" : "Sign in"}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
