"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Lock } from "lucide-react";

export default function LiveLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Sign in with Firebase Client Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Get ID token and role
      const idToken = await userCredential.user.getIdToken(true);
      const tokenResult = await userCredential.user.getIdTokenResult();
      const role = tokenResult.claims.role as string;

      // 3. Send to our API to create secure server-side session cookie
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Login failed");
      }

      // 4. Sign out of client auth (we rely strictly on the secure cookie now)
      await auth.signOut();

      // 5. Redirect to proper route based on role
      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/live");
      }
      router.refresh();
      
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid email or password.");
      } else {
        setError(err.message || "An unexpected error occurred.");
      }
      // Ensure we clean up client auth state on error just in case
      await auth.signOut().catch(() => {});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#07070f]">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-[#a1a1c7]" />
          </div>
          <h1 className="text-2xl font-bold text-[#f0f0ff] mb-2">Organizer Login</h1>
          <p className="text-[#a1a1c7] text-sm">Access the live dashboard</p>
        </div>

        <div className="glass-card p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            
            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
