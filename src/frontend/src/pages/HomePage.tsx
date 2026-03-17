import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Award, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";
import { HeroCube } from "../components/HeroCube";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const FEATURES = [
  {
    icon: Zap,
    title: "Engineered for Speed",
    desc: "Every product designed to reduce drag and maximize performance on the track.",
  },
  {
    icon: Shield,
    title: "Premium Protection",
    desc: "Military-grade materials ensuring maximum safety without compromising style.",
  },
  {
    icon: Award,
    title: "Championship Certified",
    desc: "Worn by world champions. Trusted by professionals at the highest level.",
  },
];

export function HomePage() {
  const { login, identity } = useInternetIdentity();
  const isLoggedIn = !!identity;

  return (
    <main className="min-h-screen">
      <section
        className="relative min-h-screen flex items-center"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 70%), linear-gradient(180deg, #0a0a0a 0%, #0f0c06 100%)",
        }}
        data-ocid="home.section"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center pt-24">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <p className="text-gold text-xs tracking-[0.4em] font-semibold mb-4 uppercase">
                The Pinnacle of Performance
              </p>
              <h1 className="font-display text-7xl md:text-9xl tracking-wider leading-none">
                <span className="gold-text">VELOCITY</span>
                <br />
                <span className="text-foreground">V7</span>
              </h1>
              <p className="text-muted-foreground font-body text-lg mt-6 max-w-md">
                Premium performance gear engineered for champions. Crafted with
                precision, worn with pride.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="flex gap-4 flex-wrap"
            >
              <Link to="/shop">
                <Button
                  size="lg"
                  className="bg-gold hover:bg-gold-bright text-black font-bold tracking-widest gap-2 px-8"
                  data-ocid="home.primary_button"
                >
                  SHOP NOW <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              {!isLoggedIn && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={login}
                  className="border-gold/40 text-gold hover:bg-gold/10 hover:border-gold font-semibold tracking-widest"
                  data-ocid="home.secondary_button"
                >
                  SIGN IN
                </Button>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="flex gap-8"
            >
              {(
                [
                  ["200+", "Products"],
                  ["50K+", "Athletes"],
                  ["7", "Championships"],
                ] as const
              ).map(([num, label]) => (
                <div key={label}>
                  <p className="font-display text-3xl gold-text">{num}</p>
                  <p className="text-xs text-muted-foreground tracking-widest">
                    {label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="h-[400px] md:h-[500px] relative"
          >
            <HeroCube />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 50%, rgba(201,168,76,0.15) 0%, transparent 60%)",
              }}
            />
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-5xl tracking-widest gold-text">
              WHY V7
            </h2>
            <p className="text-muted-foreground mt-4">
              Built for those who refuse to settle
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card glass-card-hover rounded-xl p-8 text-center space-y-4"
                data-ocid="home.card"
              >
                <div className="w-12 h-12 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto">
                  <f.icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-display text-xl tracking-widest">
                  {f.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="py-24 px-6 text-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(201,168,76,0.06) 0%, transparent 50%, rgba(201,168,76,0.04) 100%)",
          borderTop: "1px solid rgba(201,168,76,0.1)",
          borderBottom: "1px solid rgba(201,168,76,0.1)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto space-y-6"
        >
          <h2 className="font-display text-5xl md:text-6xl tracking-widest">
            <span className="gold-text">READY TO</span>
            <br />
            <span>DOMINATE?</span>
          </h2>
          <p className="text-muted-foreground">
            Join 50,000+ elite athletes who trust V7 for peak performance.
          </p>
          <Link to="/shop">
            <Button
              size="lg"
              className="bg-gold hover:bg-gold-bright text-black font-bold tracking-widest px-12 mt-4"
              data-ocid="home.primary_button"
            >
              EXPLORE COLLECTION
            </Button>
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
