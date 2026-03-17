import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ShoppingCart, XCircle } from "lucide-react";
import { motion } from "motion/react";

export function CheckoutCancelPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-12 text-center max-w-md w-full space-y-8"
        data-ocid="checkout.error_state"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <XCircle className="w-20 h-20 text-destructive mx-auto" />
        </motion.div>
        <div className="space-y-3">
          <h1 className="font-display text-4xl tracking-widest">CANCELLED</h1>
          <p className="text-muted-foreground">
            Your checkout was cancelled. Your cart items are still saved.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Link to="/shop">
            <Button
              variant="outline"
              className="border-gold/30 text-gold hover:bg-gold/10 gap-2"
              data-ocid="checkout.secondary_button"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Shop
            </Button>
          </Link>
          <Button
            className="bg-gold hover:bg-gold-bright text-black font-bold gap-2"
            onClick={() => window.history.back()}
            data-ocid="checkout.primary_button"
          >
            <ShoppingCart className="w-4 h-4" /> View Cart
          </Button>
        </div>
      </motion.div>
    </main>
  );
}
