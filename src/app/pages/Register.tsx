import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "../components/Button";
import { useNavigate } from "react-router";
import { Landmark } from "lucide-react";
import { supabase } from "../lib/supabase";

export function Register() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const normalizeUsername = (value: string) =>
    value.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");

  const getFriendlyError = (message: string) => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("already registered")) {
      return "A Memoirium account already exists for this email.";
    }

    if (lowerMessage.includes("password")) {
      return "Please use a stronger password for your museum account.";
    }

    if (lowerMessage.includes("duplicate")) {
      return "That username is already reserved. Please choose another.";
    }

    return "We could not create your museum yet. Please check your details and try again.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!supabase) {
      setError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.");
      return;
    }

    const cleanedUsername = normalizeUsername(username);

    if (!cleanedUsername) {
      setError("Please choose a username using letters, numbers, or underscores.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and confirmation do not match.");
      return;
    }

    setIsSubmitting(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          display_name: displayName.trim(),
          username: cleanedUsername,
        },
      },
    });

    if (signUpError) {
      setIsSubmitting(false);
      setError(getFriendlyError(signUpError.message));
      return;
    }

    if (data.user && data.session) {
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          display_name: displayName.trim(),
          username: cleanedUsername,
        },
        { onConflict: "id" },
      );

      if (profileError) {
        setIsSubmitting(false);
        setError(getFriendlyError(profileError.message));
        return;
      }

      setIsSubmitting(false);
      navigate("/dashboard", { replace: true });
      return;
    }

    setIsSubmitting(false);
    setSuccessMessage("Your museum account has been created. Please check your email to confirm your address before signing in.");
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
          <p className="text-[var(--text-secondary)] italic">Create your museum</p>
        </div>

        <div
          className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-8"
          style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm mb-2 text-[var(--text-primary)]">Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none transition-colors"
                placeholder="Your name"
                autoComplete="name"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-[var(--text-primary)]">Username</label>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none transition-colors"
                placeholder="museum_curator"
                autoComplete="username"
                required
              />
            </div>

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
                autoComplete="new-password"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-[var(--text-primary)]">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none transition-colors"
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="rounded-lg border border-[var(--gold-primary)]/30 bg-[var(--gold-primary)]/10 px-4 py-3 text-sm text-[var(--gold-secondary)]">
                {successMessage}
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating Museum..." : "Create Museum"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-[var(--gold-primary)] hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
