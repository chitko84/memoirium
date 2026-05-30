import { motion } from "motion/react";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = "", hoverable = false, onClick }: CardProps) {
  const Component = hoverable ? motion.div : "div";

  return (
    <Component
      className={`bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden ${className}`}
      onClick={onClick}
      {...(hoverable ? {
        whileHover: { y: -4, borderColor: "var(--gold-primary)" },
        transition: { duration: 0.3 }
      } : {})}
      style={{
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)"
      }}
    >
      {children}
    </Component>
  );
}
