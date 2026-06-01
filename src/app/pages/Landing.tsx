import { motion } from "framer-motion";
import { Button } from "../components/Button";
import { Link, useNavigate } from "react-router";
import { Landmark, BookOpen, Users, Heart, Camera, Archive, Share2 } from "lucide-react";

export function Landing() {
  const navigate = useNavigate();

  const features = [
    { icon: Archive, title: "Exhibition Rooms", description: "Organize your artifacts into beautiful, thematic rooms" },
    { icon: Camera, title: "Interactive Timeline", description: "Journey through your memories chronologically" },
    { icon: Landmark, title: "Public Museums", description: "Share your story with the world" },
    { icon: Heart, title: "Emotional Storytelling", description: "Capture the feeling behind every moment" }
  ];

  const steps = [
    {
      number: "01",
      title: "Create Exhibition Room",
      description: "Start by creating a themed room for your artifacts",
      image:
        "https://images.unsplash.com/photo-1620496866641-af6f9aef5131?auto=format&fit=crop&w=1200&q=85",
      imageAlt: "Museum gallery with framed artwork and warm architectural light"
    },
    {
      number: "02",
      title: "Add Artifacts",
      description: "Upload photos, write stories, and tag emotions",
      image:
        "https://images.unsplash.com/photo-1516981879613-9f5da904015f?auto=format&fit=crop&w=1200&q=85",
      imageAlt: "Vintage photographs arranged as personal memories"
    },
    {
      number: "03",
      title: "Explore Your Museum",
      description: "Navigate your memories in an elegant gallery interface",
      image:
        "https://images.unsplash.com/photo-1545987796-200677ee1011?auto=format&fit=crop&w=1200&q=85",
      imageAlt: "Modern digital exhibition with immersive illuminated displays"
    },
    {
      number: "04",
      title: "Share With Others",
      description: "Invite others to experience your personal museum",
      image:
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85",
      imageAlt: "People gathered together sharing an experience"
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Section */}
      <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden py-14 sm:py-20 md:min-h-screen md:py-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)] to-[var(--background)]" />

        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[var(--gold-primary)] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--gold-primary)] rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-5xl px-5 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 className="mb-4 max-w-full whitespace-nowrap text-center text-[3rem] leading-none tracking-[0.04em] text-[var(--gold-primary)] sm:text-[4rem] md:mb-6 md:text-8xl md:tracking-wide lg:text-9xl">
              MEMOIRIUM
            </h1>
            <p className="mx-auto mb-3 max-w-xs text-lg text-[var(--gold-secondary)] italic sm:max-w-md sm:text-xl md:mb-4 md:max-w-none md:text-3xl">
              Every memory deserves a gallery.
            </p>
            <p className="mx-auto mb-8 max-w-[34rem] px-1 text-sm leading-6 text-[var(--text-secondary)] sm:px-0 sm:text-base sm:leading-7 md:mb-12 md:max-w-2xl md:text-lg md:leading-relaxed">
              Transform your personal memories into curated museum exhibitions. Create collections, upload memories, write stories, and explore them through elegant gallery-inspired interfaces.
            </p>

            <div className="mx-auto flex w-full max-w-sm flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row sm:gap-4">
              <Button variant="primary" size="lg" className="min-h-11 w-full px-6 py-3 text-base sm:w-auto md:min-h-0 md:px-8 md:py-4 md:text-lg" onClick={() => navigate("/login")}>
                <Landmark size={18} className="md:h-5 md:w-5" />
                Enter Museum
              </Button>
              <Button variant="secondary" size="lg" className="min-h-11 w-full px-6 py-3 text-base sm:w-auto md:min-h-0 md:px-8 md:py-4 md:text-lg" onClick={() => navigate("/discover")}>
                <Share2 size={18} className="md:h-5 md:w-5" />
                Explore Public Museums
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl mb-4 text-[var(--gold-primary)]">A Museum for Your Life</h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Preserve and present your most precious moments with museum-quality curation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-8 hover:border-[var(--gold-primary)] transition-all duration-300"
                  style={{ boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)" }}
                >
                  <div className="w-14 h-14 bg-[var(--gold-primary)]/10 rounded-lg flex items-center justify-center mb-6">
                    <Icon size={28} className="text-[var(--gold-primary)]" />
                  </div>
                  <h3 className="text-xl mb-3 text-[var(--text-primary)]">{feature.title}</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 px-6 bg-[var(--surface)]/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl mb-4 text-[var(--gold-primary)]">How It Works</h2>
            <p className="text-lg text-[var(--text-secondary)]">
              Four simple steps to create your digital museum
            </p>
          </motion.div>

          <div className="space-y-24">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row items-center gap-12"
              >
                <div className="flex-1 text-center md:text-left">
                  <div className="text-6xl text-[var(--gold-primary)]/20 mb-4">{step.number}</div>
                  <h3 className="text-3xl mb-4 text-[var(--gold-primary)]">{step.title}</h3>
                  <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                    {step.description}
                  </p>
                </div>
                <div
                  className="group relative flex-1 aspect-video overflow-hidden rounded-lg border border-[var(--gold-primary)]/60 bg-[var(--surface)]"
                  style={{ boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)" }}
                >
                  <img
                    src={step.image}
                    alt={step.imageAlt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                  <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-[var(--gold-secondary)]/20" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-2xl text-[var(--gold-primary)] tracking-wider mb-2">MEMOIRIUM</h3>
              <p className="text-sm text-[var(--text-secondary)]">Every memory deserves a gallery.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm sm:gap-8">
              <a href="https://my.linkedin.com/in/chit-ko-ko-0b30a3299" target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--gold-primary)] transition-colors">About</a>
              <a href="https://my.linkedin.com/in/chit-ko-ko-0b30a3299" target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--gold-primary)] transition-colors">Contact</a>
              <a href="https://github.com/chitko84" target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--gold-primary)] transition-colors">GitHub</a>
              <Link to="/privacy" className="text-[var(--text-secondary)] hover:text-[var(--gold-primary)] transition-colors">Privacy Policy</Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-[var(--border)] text-center text-sm text-[var(--text-secondary)]">
            © 2026 Memoirium. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
