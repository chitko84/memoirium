import { Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";

const sections = [
  {
    title: "Memoirium overview",
    body:
      "Memoirium is a digital memory museum for preserving personal stories, collections, images, and public exhibitions. The product is designed to help people curate meaningful memories in a gallery-inspired experience.",
  },
  {
    title: "What information is collected",
    body:
      "Memoirium may collect account details, profile information, memory entries, uploaded images, collection metadata, public museum settings, guestbook messages, comments, likes, and basic technical information needed to operate the service.",
  },
  {
    title: "Account data",
    body:
      "When you create an account, Memoirium stores the information required to identify your profile, authenticate access, and connect your collections and memories to your account.",
  },
  {
    title: "Memories and uploaded images",
    body:
      "Memories, stories, captions, emotions, dates, collection details, and uploaded images are stored so they can be displayed in your private dashboard or public museum, depending on the visibility choices you make.",
  },
  {
    title: "Public museum visibility",
    body:
      "If you publish or share a museum, selected profile details, collections, memories, images, and descriptive text may become visible to visitors. You should only publish content that you are comfortable sharing publicly.",
  },
  {
    title: "Guestbook, comments, and likes",
    body:
      "Public interaction features may store visitor names, guestbook entries, comments, reactions, likes, and related timestamps so that public museums can preserve visitor engagement.",
  },
  {
    title: "Supabase backend provider",
    body:
      "Memoirium uses Supabase as its backend provider for authentication, database storage, and related infrastructure. Data handled by Supabase is processed according to the controls and safeguards provided by that platform.",
  },
  {
    title: "User deletion and privacy control",
    body:
      "You control what you add to Memoirium and whether museum content is kept private or made public. You may delete memories, collections, uploaded content, or account-related information through available product controls or by requesting help.",
  },
  {
    title: "Contact",
    body:
      "For privacy questions, deletion requests, or product concerns, contact Memoirium through LinkedIn.",
  },
];

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <main className="mx-auto max-w-4xl px-5 py-12 sm:px-6 md:py-20">
        <Link
          to="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--gold-primary)]"
        >
          <ArrowLeft size={16} />
          Back to Memoirium
        </Link>

        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-12 border-b border-[var(--border)] pb-10 text-center"
        >
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-lg border border-[var(--gold-primary)]/60 bg-[var(--gold-primary)]/10">
            <Shield size={26} className="text-[var(--gold-primary)]" />
          </div>
          <p className="mb-3 text-sm uppercase tracking-[0.28em] text-[var(--gold-secondary)]">Memoirium</p>
          <h1 className="mb-5 text-4xl tracking-wide text-[var(--gold-primary)] sm:text-5xl">Privacy Policy</h1>
          <p className="mx-auto max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base sm:leading-7">
            This policy explains how Memoirium handles account information, personal memories, uploaded images,
            public museum content, and visitor engagement data.
          </p>
          <p className="mt-5 text-sm text-[var(--gold-secondary)]">Last updated: 2026</p>
        </motion.header>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              className="border border-[var(--border)] bg-[var(--surface)]/70 p-6"
              style={{ boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)" }}
            >
              <h2 className="mb-3 text-2xl text-[var(--gold-primary)]">{section.title}</h2>
              <p className="text-sm leading-6 text-[var(--text-secondary)] sm:text-base sm:leading-7">
                {section.title === "Contact" ? (
                  <>
                    For privacy questions, deletion requests, or product concerns, contact Memoirium through{" "}
                    <a
                      href="https://my.linkedin.com/in/chit-ko-ko-0b30a3299"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--gold-primary)] underline-offset-4 hover:underline"
                    >
                      LinkedIn
                    </a>
                    .
                  </>
                ) : (
                  section.body
                )}
              </p>
            </motion.section>
          ))}
        </div>
      </main>
    </div>
  );
}
