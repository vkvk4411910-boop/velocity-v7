import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQueryClient } from "@tanstack/react-query";
import {
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCartStore } from "../store/cartStore";

export function CartSidebar() {
  const cartStore = useCartStore();
  const { isOpen, items, closeCart, removeItem, updateQuantity, clearCart } =
    cartStore;
  const totalCents = cartStore.totalCents();
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const actorReady = !!actor && !actorFetching;
  const [placingOrder, setPlacingOrder] = useState(false);
  const queryClient = useQueryClient();

  async function handleBuyNow() {
    if (!identity) {
      toast.error("Please sign in to place an order.");
      return;
    }
    if (!actor) {
      toast.error("Still connecting, please wait a moment.");
      return;
    }
    if (items.length === 0) return;

    setPlacingOrder(true);
    try {
      const orderItems = items.map((item) => ({
        productId: BigInt(0),
        productName: item.name,
        quantity: BigInt(item.quantity),
        priceCents: BigInt(item.priceCents),
      }));

      await actor.placeOrderDirect(orderItems, BigInt(Math.round(totalCents)));

      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.refetchQueries({ queryKey: ["orders"] });

      clearCart();
      closeCart();
      toast.success("Order saved! Open Dashboard to see your order.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("sign in") || msg.includes("Unauthorized")) {
        toast.error("Session expired. Please sign out and sign in again.");
      } else if (
        msg.includes("Cart is empty") ||
        msg.includes("at least one")
      ) {
        toast.error("Your cart is empty.");
      } else {
        toast.error(`Order failed: ${msg || "Please try again."}`);
      }
    } finally {
      setPlacingOrder(false);
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
                        ₹{(item.priceCents / 100).toFixed(0)}
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
              <div className="p-6 border-t border-gold/20 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-display text-xl gold-text">
                    ₹{(totalCents / 100).toFixed(0)}
                  </span>
                </div>
                <Separator className="bg-gold/20" />

                {!identity && (
                  <p className="text-center text-xs text-amber-400 py-1">
                    Sign in to place orders
                  </p>
                )}

                <Button
                  className="w-full bg-gold hover:bg-yellow-400 text-black font-bold tracking-widest gap-2 py-6 text-base shadow-lg shadow-gold/20"
                  onClick={handleBuyNow}
                  disabled={placingOrder || !identity || !actorReady}
                  title={
                    !identity
                      ? "Sign in to place an order"
                      : !actorReady
                        ? "Connecting to server..."
                        : "Save order to your dashboard"
                  }
                  data-ocid="cart.buy_now_button"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {placingOrder
                    ? "SAVING ORDER..."
                    : actorFetching && !!identity
                      ? "CONNECTING..."
                      : "BUY NOW — SAVE ORDER"}
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
