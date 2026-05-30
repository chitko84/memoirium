import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "../components/Button";
import { useLocation, useNavigate } from "react-router";
import { Landmark } from "lucide-react";
import { supabase } from "../lib/supabase";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/dashboard";

  const getFriendlyError = (message: string) => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("invalid login")) {
      return "That email and password combination does not match a Memoirium account.";
    }

    if (lowerMessage.includes("email not confirmed")) {
      return "Please confirm your email before entering your museum.";
    }

    return "We could not sign you in. Please check your details and try again.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!supabase) {
      setError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.");
      return;
    }

    setIsSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setIsSubmitting(false);

    if (signInError) {
      setError(getFriendlyError(signInError.message));
      return;
    }

    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[var(--gold-primary)] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--gold-primary)] rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Landmark size={32} className="text-[var(--gold-primary)]" />
            <h1 className="text-4xl text-[var(--gold-primary)] tracking-wider">MEMOIRIUM</h1>
          </div>
          <p className="text-[var(--text-secondary)] italic">Enter your museum</p>
        </div>

        <div
          className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-8"
          style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm mb-2 text-[var(--text-primary)]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none transition-colors"
                placeholder="curator@memoirium.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-[var(--text-primary)]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none transition-colors"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Opening Museum..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-[var(--gold-primary)] hover:underline"
              >
                Create Museum
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
