import { Button } from "@/components/ui/button";
import { Link, useSearch } from "@tanstack/react-router";
import { ArrowRight, CheckCircle, Loader2, Package } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useCartStore } from "../store/cartStore";

export function CheckoutSuccessPage() {
  const search = useSearch({ strict: false }) as { session_id?: string };
  const sessionId = search?.session_id || "";
  const { actor } = useActor();
  const { clearCart } = useCartStore();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading",
  );

  useEffect(() => {
    clearCart();
    if (!sessionId || !actor) {
      setStatus("success");
      return;
    }
    actor
      .getStripeSessionStatus(sessionId)
      .then((s) => {
        setStatus(s.__kind__ === "failed" ? "failed" : "success");
      })
      .catch(() => setStatus("success"));
  }, [sessionId, actor, clearCart]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-12 text-center max-w-md w-full space-y-8"
        data-ocid="checkout.success_state"
      >
        {status === "loading" ? (
          <Loader2 className="w-16 h-16 text-gold animate-spin mx-auto" />
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <CheckCircle className="w-20 h-20 text-green-400 mx-auto" />
            </motion.div>
            <div className="space-y-3">
              <h1 className="font-display text-4xl tracking-widest gold-text">
                ORDER PLACED!
              </h1>
              <p className="text-muted-foreground">
                Thank you for your purchase. Your V7 gear is on its way.
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Link to="/dashboard">
                <Button
                  variant="outline"
                  className="border-gold/30 text-gold hover:bg-gold/10 gap-2"
                  data-ocid="checkout.secondary_button"
                >
                  <Package className="w-4 h-4" /> My Orders
                </Button>
              </Link>
              <Link to="/shop">
                <Button
                  className="bg-gold hover:bg-gold-bright text-black font-bold gap-2"
                  data-ocid="checkout.primary_button"
                >
                  Shop More <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </main>
  );
}
