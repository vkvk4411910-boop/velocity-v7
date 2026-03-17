import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateCheckoutSession } from "../hooks/useQueries";
import { useCartStore } from "../store/cartStore";

export function CartSidebar() {
  const cartStore = useCartStore();
  const { isOpen, items, closeCart, removeItem, updateQuantity, clearCart } =
    cartStore;
  const totalCents = cartStore.totalCents();
  const { mutateAsync: createCheckout, isPending } = useCreateCheckoutSession();
  const { identity } = useInternetIdentity();
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (!identity) {
      toast.error("Please sign in to checkout");
      return;
    }
    if (items.length === 0) return;

    setLoading(true);
    try {
      const shoppingItems = items.map((item) => ({
        productName: item.name,
        currency: "usd",
        quantity: BigInt(item.quantity),
        priceInCents: BigInt(item.priceCents),
        productDescription: item.name,
      }));

      const successUrl = `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/checkout/cancel`;

      const url = await createCheckout({
        items: shoppingItems,
        successUrl,
        cancelUrl,
      });
      clearCart();
      window.location.href = url;
    } catch {
      toast.error("Checkout failed. Please ensure Stripe is configured.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={closeCart}
            data-ocid="cart.modal"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col"
            style={{
              background: "#0f0f0f",
              borderLeft: "1px solid rgba(201,168,76,0.2)",
            }}
          >
            <div className="flex items-center justify-between p-6 border-b border-gold/20">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-gold" />
                <h2 className="font-display text-xl tracking-widest gold-text">
                  YOUR CART
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeCart}
                className="text-gold/60 hover:text-gold hover:bg-gold/10"
                data-ocid="cart.close_button"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center h-full text-center"
                  data-ocid="cart.empty_state"
                >
                  <ShoppingBag className="w-16 h-16 text-gold/20 mb-4" />
                  <p className="text-muted-foreground">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground/60 mt-1">
                    Add items to get started
                  </p>
                </div>
              ) : (
                items.map((item, idx) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-4 glass-card rounded-lg p-3"
                    data-ocid={`cart.item.${idx + 1}`}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-gold text-sm font-bold">
                        ${(item.priceCents / 100).toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="w-6 h-6 rounded border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/10"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          className="w-6 h-6 rounded border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/10"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="text-destructive/60 hover:text-destructive transition-colors"
                      data-ocid={`cart.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-gold/20 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-display text-xl gold-text">
                    ${(totalCents / 100).toFixed(2)}
                  </span>
                </div>
                <Separator className="bg-gold/20" />
                <Button
                  className="w-full bg-gold hover:bg-gold-bright text-black font-bold tracking-widest"
                  onClick={handleCheckout}
                  disabled={loading || isPending}
                  data-ocid="cart.submit_button"
                >
                  {loading ? "Redirecting..." : "CHECKOUT WITH STRIPE"}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground text-xs"
                  onClick={() => {
                    clearCart();
                    closeCart();
                  }}
                  data-ocid="cart.delete_button.1"
                >
                  Clear Cart
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
