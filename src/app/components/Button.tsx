import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className = "",
  type = "button",
  disabled = false
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center gap-2 transition-all duration-300 border disabled:cursor-not-allowed disabled:opacity-60";

  const variantStyles = {
    primary: "bg-[var(--gold-primary)] text-[#0F1115] border-[var(--gold-primary)] hover:bg-[var(--gold-secondary)] hover:border-[var(--gold-secondary)]",
    secondary: "bg-transparent text-[var(--gold-primary)] border-[var(--gold-primary)] hover:bg-[var(--gold-primary)] hover:text-[#0F1115]",
    outline: "bg-transparent text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--gold-primary)] hover:text-[var(--gold-primary)]"
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <motion.button
      type={type}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}
