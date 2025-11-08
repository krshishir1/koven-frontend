import Navbar from "@/components/shared/Navbar";
import Hero from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import Leaderboard from "@/components/landing/Leaderboard";
import Footer from "@/components/shared/Footer";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-tl from-primary/5 via-secondary/5 to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,var(--primary)_0%,transparent_50%)] opacity-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,var(--secondary)_0%,transparent_50%)] opacity-15" />
      </div>

      <Navbar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Leaderboard />
      </main>
      <Footer />
    </div>
  );
}
