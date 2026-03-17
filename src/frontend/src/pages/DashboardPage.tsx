import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, Loader2, Package, Save, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatus } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useOrders, useSaveProfile, useUserProfile } from "../hooks/useQueries";

const STATUS_COLOR: Record<string, string> = {
  [OrderStatus.pending]:
    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  [OrderStatus.paid]: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  [OrderStatus.shipped]:
    "bg-purple-500/20 text-purple-400 border-purple-500/30",
  [OrderStatus.delivered]: "bg-green-500/20 text-green-400 border-green-500/30",
};

export function DashboardPage() {
  const { identity, login } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { mutateAsync: saveProfile, isPending: saving } = useSaveProfile();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  function startEdit() {
    setName(profile?.name || "");
    setEditing(true);
  }

  async function handleSave() {
    try {
      await saveProfile({ name });
      toast.success("Profile saved");
      setEditing(false);
    } catch {
      toast.error("Failed to save profile");
    }
  }

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center space-y-6" data-ocid="dashboard.section">
          <User className="w-16 h-16 text-gold/30 mx-auto" />
          <h2 className="font-display text-4xl tracking-widest">
            SIGN IN REQUIRED
          </h2>
          <p className="text-muted-foreground">
            Please sign in to access your dashboard.
          </p>
          <Button
            onClick={login}
            className="bg-gold hover:bg-gold-bright text-black font-bold tracking-widest"
            data-ocid="dashboard.primary_button"
          >
            SIGN IN
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p className="text-gold text-xs tracking-[0.4em] font-semibold mb-2 uppercase">
            Account
          </p>
          <h1 className="font-display text-6xl tracking-widest gold-text">
            DASHBOARD
          </h1>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Profile */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-xl p-6 space-y-6"
            data-ocid="dashboard.card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gold" />
                <h2 className="font-display text-xl tracking-widest">
                  PROFILE
                </h2>
              </div>
              {!editing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={startEdit}
                  className="text-gold/60 hover:text-gold"
                  data-ocid="dashboard.edit_button"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            {profileLoading ? (
              <div
                className="animate-pulse space-y-3"
                data-ocid="dashboard.loading_state"
              >
                <div className="h-4 bg-gold/10 rounded w-3/4" />
                <div className="h-4 bg-gold/10 rounded w-1/2" />
              </div>
            ) : editing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gold/70 text-xs tracking-widest">
                    DISPLAY NAME
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-black/40 border-gold/30 focus:border-gold"
                    placeholder="Enter your name"
                    data-ocid="dashboard.input"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gold hover:bg-gold-bright text-black font-bold gap-2"
                    data-ocid="dashboard.save_button"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setEditing(false)}
                    className="text-muted-foreground"
                    data-ocid="dashboard.cancel_button"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground tracking-widest mb-1">
                    NAME
                  </p>
                  <p className="font-semibold">{profile?.name || "Not set"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground tracking-widest mb-1">
                    PRINCIPAL
                  </p>
                  <p className="text-xs font-mono text-gold/70 break-all">
                    {identity?.getPrincipal().toString()}
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Orders */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-6 space-y-4"
            data-ocid="dashboard.card"
          >
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-gold" />
              <h2 className="font-display text-xl tracking-widest">ORDERS</h2>
            </div>

            {ordersLoading ? (
              <div className="space-y-3" data-ocid="dashboard.loading_state">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-gold/5 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : !orders || orders.length === 0 ? (
              <div
                className="text-center py-8"
                data-ocid="dashboard.empty_state"
              >
                <Package className="w-10 h-10 text-gold/20 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order, idx) => (
                  <div
                    key={order.id.toString()}
                    className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-gold/10"
                    data-ocid={`dashboard.item.${idx + 1}`}
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        Order #{order.id.toString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${(Number(order.totalCents) / 100).toFixed(2)}
                      </p>
                    </div>
                    <Badge
                      className={`text-[10px] tracking-widest border ${STATUS_COLOR[order.status] || ""}`}
                    >
                      {order.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
