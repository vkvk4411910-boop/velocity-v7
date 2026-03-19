import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Edit2,
  ExternalLink,
  Loader2,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatus, type Product } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllOrders,
  useCreateProduct,
  useDeleteProduct,
  useIsAdmin,
  useIsStripeConfigured,
  useProducts,
  useSetStripeConfig,
  useUpdateOrderStatus,
  useUpdateProduct,
} from "../hooks/useQueries";

const EMPTY_PRODUCT: Omit<Product, "id"> = {
  name: "",
  description: "",
  priceCents: BigInt(0),
  category: "Apparel",
  imageUrl: "",
  stock: BigInt(0),
};

function ProductForm({
  initial,
  onSave,
  onCancel,
  isPending,
}: {
  initial: Omit<Product, "id">;
  onSave: (p: Omit<Product, "id">) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState(initial);

  const update = (key: keyof typeof form, val: string) => {
    setForm((prev) => ({
      ...prev,
      [key]:
        key === "priceCents" || key === "stock"
          ? BigInt(Math.max(0, Number(val)))
          : val,
    }));
  };

  return (
    <div className="space-y-4">
      {(["name", "description", "imageUrl"] as const).map((field) => (
        <div key={field} className="space-y-1">
          <Label className="text-gold/70 text-xs tracking-widest">
            {field.toUpperCase()}
          </Label>
          <Input
            value={String(form[field])}
            onChange={(e) => update(field, e.target.value)}
            className="bg-black/40 border-gold/30 focus:border-gold"
            data-ocid="admin.input"
          />
        </div>
      ))}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-gold/70 text-xs tracking-widest">
            PRICE (CENTS)
          </Label>
          <Input
            type="number"
            value={Number(form.priceCents)}
            onChange={(e) => update("priceCents", e.target.value)}
            className="bg-black/40 border-gold/30 focus:border-gold"
            data-ocid="admin.input"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-gold/70 text-xs tracking-widest">STOCK</Label>
          <Input
            type="number"
            value={Number(form.stock)}
            onChange={(e) => update("stock", e.target.value)}
            className="bg-black/40 border-gold/30 focus:border-gold"
            data-ocid="admin.input"
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-gold/70 text-xs tracking-widest">CATEGORY</Label>
        <Select
          value={form.category}
          onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
        >
          <SelectTrigger
            className="bg-black/40 border-gold/30"
            data-ocid="admin.select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["Apparel", "Gear", "Footwear", "Accessories"].map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-3 pt-2">
        <Button
          onClick={() => onSave(form)}
          disabled={isPending}
          className="bg-gold hover:bg-gold-bright text-black font-bold gap-2"
          data-ocid="admin.submit_button"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          Save
        </Button>
        <Button
          variant="ghost"
          onClick={onCancel}
          className="text-muted-foreground"
          data-ocid="admin.cancel_button"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function AdminPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: orders, isLoading: ordersLoading } = useAllOrders();
  const { data: stripeConfigured } = useIsStripeConfigured();
  const { mutateAsync: createProduct, isPending: creating } =
    useCreateProduct();
  const { mutateAsync: updateProduct, isPending: updating } =
    useUpdateProduct();
  const { mutateAsync: deleteProduct, isPending: deleting } =
    useDeleteProduct();
  const { mutateAsync: updateStatus, isPending: updatingStatus } =
    useUpdateOrderStatus();
  const { mutateAsync: setStripeConfig, isPending: savingStripe } =
    useSetStripeConfig();

  const [newProductOpen, setNewProductOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [stripeKey, setStripeKey] = useState("");
  const [stripeCountries, setStripeCountries] = useState("IN,US,GB,CA,AU");

  if (!identity) {
    return (
      <main className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center" data-ocid="admin.section">
          <Shield className="w-16 h-16 text-gold/30 mx-auto mb-4" />
          <h2 className="font-display text-4xl tracking-widest">
            SIGN IN REQUIRED
          </h2>
        </div>
      </main>
    );
  }

  if (adminLoading) {
    return (
      <main className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2
          className="w-8 h-8 animate-spin text-gold"
          data-ocid="admin.loading_state"
        />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center" data-ocid="admin.section">
          <Shield className="w-16 h-16 text-destructive/40 mx-auto mb-4" />
          <h2 className="font-display text-4xl tracking-widest">
            ACCESS DENIED
          </h2>
          <p className="text-muted-foreground mt-2">
            Admin privileges required.
          </p>
        </div>
      </main>
    );
  }

  async function handleCreateProduct(form: Omit<Product, "id">) {
    try {
      await createProduct({ ...form, id: BigInt(0) });
      toast.success("Product created");
      setNewProductOpen(false);
    } catch {
      toast.error("Failed to create product");
    }
  }

  async function handleUpdateProduct(form: Omit<Product, "id">) {
    if (!editProduct) return;
    try {
      await updateProduct({ ...form, id: editProduct.id });
      toast.success("Product updated");
      setEditProduct(null);
    } catch {
      toast.error("Failed to update product");
    }
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  }

  async function handleStatusUpdate(orderId: bigint, status: OrderStatus) {
    try {
      await updateStatus({ orderId, status });
      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update order");
    }
  }

  async function handleSaveStripe() {
    try {
      await setStripeConfig({
        secretKey: stripeKey,
        allowedCountries: stripeCountries.split(",").map((c) => c.trim()),
      });
      toast.success(
        "Stripe configured successfully! Card checkout is now active.",
      );
      setStripeKey("");
    } catch {
      toast.error("Failed to save Stripe config");
    }
  }

  return (
    <main className="min-h-screen pt-24 pb-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-gold" />
            <p className="text-gold text-xs tracking-[0.4em] font-semibold uppercase">
              Admin Panel
            </p>
          </div>
          <h1 className="font-display text-6xl tracking-widest gold-text">
            CONTROL CENTER
          </h1>
        </motion.div>

        <Tabs defaultValue="products" data-ocid="admin.tab">
          <TabsList className="bg-black/40 border border-gold/20 mb-8">
            <TabsTrigger
              value="products"
              className="data-[state=active]:bg-gold data-[state=active]:text-black font-semibold tracking-wider"
              data-ocid="admin.tab"
            >
              PRODUCTS
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-gold data-[state=active]:text-black font-semibold tracking-wider"
              data-ocid="admin.tab"
            >
              ORDERS
            </TabsTrigger>
            <TabsTrigger
              value="stripe"
              className="data-[state=active]:bg-gold data-[state=active]:text-black font-semibold tracking-wider"
              data-ocid="admin.tab"
            >
              STRIPE
            </TabsTrigger>
          </TabsList>

          {/* PRODUCTS TAB */}
          <TabsContent value="products">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl tracking-widest">
                PRODUCTS
              </h2>
              <Dialog open={newProductOpen} onOpenChange={setNewProductOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-gold hover:bg-gold-bright text-black font-bold gap-2"
                    data-ocid="admin.open_modal_button"
                  >
                    <Plus className="w-4 h-4" /> ADD PRODUCT
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="bg-[#111] border-gold/25 max-w-lg"
                  data-ocid="admin.dialog"
                >
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl tracking-widest gold-text">
                      NEW PRODUCT
                    </DialogTitle>
                  </DialogHeader>
                  <ProductForm
                    initial={EMPTY_PRODUCT}
                    onSave={handleCreateProduct}
                    onCancel={() => setNewProductOpen(false)}
                    isPending={creating}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {productsLoading ? (
              <div className="space-y-3" data-ocid="admin.loading_state">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-14 bg-gold/5 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div
                className="glass-card rounded-xl overflow-hidden"
                data-ocid="admin.table"
              >
                <Table>
                  <TableHeader>
                    <TableRow className="border-gold/20 hover:bg-gold/5">
                      <TableHead className="text-gold/70 tracking-widest text-xs">
                        NAME
                      </TableHead>
                      <TableHead className="text-gold/70 tracking-widest text-xs">
                        CATEGORY
                      </TableHead>
                      <TableHead className="text-gold/70 tracking-widest text-xs">
                        PRICE
                      </TableHead>
                      <TableHead className="text-gold/70 tracking-widest text-xs">
                        STOCK
                      </TableHead>
                      <TableHead className="text-gold/70 tracking-widest text-xs">
                        ACTIONS
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(products || []).length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground py-8"
                          data-ocid="admin.empty_state"
                        >
                          No products yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      (products || []).map((product) => (
                        <TableRow
                          key={product.id.toString()}
                          className="border-gold/10 hover:bg-gold/5"
                          data-ocid="admin.row"
                        >
                          <TableCell className="font-semibold">
                            {product.name}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-gold/10 text-gold border-gold/20 text-[10px]">
                              {product.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gold">
                            ₹{(Number(product.priceCents) / 100).toFixed(2)}
                          </TableCell>
                          <TableCell>{Number(product.stock)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog
                                open={editProduct?.id === product.id}
                                onOpenChange={(o) => !o && setEditProduct(null)}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditProduct(product)}
                                    className="text-gold/60 hover:text-gold w-8 h-8"
                                    data-ocid="admin.edit_button"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent
                                  className="bg-[#111] border-gold/25 max-w-lg"
                                  data-ocid="admin.dialog"
                                >
                                  <DialogHeader>
                                    <DialogTitle className="font-display text-2xl tracking-widest gold-text">
                                      EDIT PRODUCT
                                    </DialogTitle>
                                  </DialogHeader>
                                  {editProduct && (
                                    <ProductForm
                                      initial={{
                                        name: editProduct.name,
                                        description: editProduct.description,
                                        priceCents: editProduct.priceCents,
                                        category: editProduct.category,
                                        imageUrl: editProduct.imageUrl,
                                        stock: editProduct.stock,
                                      }}
                                      onSave={handleUpdateProduct}
                                      onCancel={() => setEditProduct(null)}
                                      isPending={updating}
                                    />
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(product.id)}
                                disabled={deleting}
                                className="text-destructive/60 hover:text-destructive w-8 h-8"
                                data-ocid="admin.delete_button"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* ORDERS TAB */}
          <TabsContent value="orders">
            <h2 className="font-display text-2xl tracking-widest mb-6">
              ALL ORDERS
            </h2>
            {ordersLoading ? (
              <div className="space-y-3" data-ocid="admin.loading_state">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-14 bg-gold/5 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gold/20">
                      <TableHead className="text-gold/70 text-xs tracking-widest">
                        ORDER
                      </TableHead>
                      <TableHead className="text-gold/70 text-xs tracking-widest">
                        BUYER
                      </TableHead>
                      <TableHead className="text-gold/70 text-xs tracking-widest">
                        ITEMS BOUGHT
                      </TableHead>
                      <TableHead className="text-gold/70 text-xs tracking-widest">
                        TOTAL
                      </TableHead>
                      <TableHead className="text-gold/70 text-xs tracking-widest">
                        STATUS
                      </TableHead>
                      <TableHead className="text-gold/70 text-xs tracking-widest">
                        UPDATE
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(orders || []).length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground py-8"
                          data-ocid="admin.empty_state"
                        >
                          No orders yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      (orders || []).map((order) => {
                        const principalStr = order.user
                          ? order.user.toString()
                          : "";
                        return (
                          <TableRow
                            key={order.id.toString()}
                            className="border-gold/10 hover:bg-gold/5"
                            data-ocid="admin.row"
                          >
                            <TableCell className="font-mono text-sm">
                              #{order.id.toString()}
                            </TableCell>
                            <TableCell>
                              <p className="text-xs font-mono text-muted-foreground">
                                {principalStr
                                  ? `${principalStr.slice(0, 10)}…`
                                  : "—"}
                              </p>
                            </TableCell>
                            <TableCell className="max-w-[220px]">
                              <ul className="space-y-1">
                                {(order.items || []).map((item, iIdx) => {
                                  const qty = Number(item.quantity);
                                  const priceCents = Number(item.priceCents);
                                  const linePrice = `₹${((priceCents * qty) / 100).toFixed(0)}`;
                                  return (
                                    <li
                                      key={`order-${order.id}-${iIdx}`}
                                      className="text-xs"
                                    >
                                      <span className="text-foreground font-medium">
                                        {item.productName}
                                      </span>
                                      <span className="text-muted-foreground">
                                        {" "}
                                        ×{qty}
                                      </span>
                                      <span className="text-gold ml-1">
                                        — {linePrice}
                                      </span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </TableCell>
                            <TableCell className="text-gold font-bold text-base">
                              ₹{(Number(order.totalCents) / 100).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge className="text-[10px] tracking-widest">
                                {order.status.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={order.status}
                                onValueChange={(v) =>
                                  handleStatusUpdate(order.id, v as OrderStatus)
                                }
                                disabled={updatingStatus}
                              >
                                <SelectTrigger
                                  className="w-32 h-8 bg-black/40 border-gold/20 text-xs"
                                  data-ocid="admin.select"
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.values(OrderStatus).map((s) => (
                                    <SelectItem
                                      key={s}
                                      value={s}
                                      className="text-xs"
                                    >
                                      {s.toUpperCase()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* STRIPE TAB */}
          <TabsContent value="stripe">
            <div className="max-w-lg">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-5 h-5 text-gold" />
                <h2 className="font-display text-2xl tracking-widest">
                  STRIPE CONFIGURATION
                </h2>
              </div>

              {/* Status banner */}
              {stripeConfigured ? (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-4 rounded-xl border border-green-500/30 bg-green-500/5 mb-6"
                  data-ocid="admin.success_state"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-300 font-semibold text-sm tracking-wide">
                      Stripe is active
                    </p>
                    <p className="text-green-400/60 text-xs mt-0.5">
                      Card checkout is enabled for all users.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div
                  className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 mb-6"
                  data-ocid="admin.error_state"
                >
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-300 font-semibold text-sm tracking-wide">
                      Stripe is not configured
                    </p>
                    <p className="text-amber-400/60 text-xs mt-0.5">
                      Card checkout is disabled. Enter your secret key below to
                      enable it.
                    </p>
                  </div>
                </div>
              )}

              {/* Instructions callout */}
              <div className="glass-card rounded-xl p-4 mb-4 border border-gold/10 space-y-3">
                <p className="text-gold/80 text-xs tracking-widest font-semibold uppercase">
                  Setup Instructions
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Stripe must be configured after each new deployment. Your key
                  is stored securely in the backend canister.
                </p>
                <ol className="space-y-2">
                  {[
                    {
                      step: "1",
                      text: "Get your key",
                      sub: "stripe.com → Developers → API Keys",
                      link: "https://dashboard.stripe.com/apikeys",
                    },
                    {
                      step: "2",
                      text: "Paste it below",
                      sub: "Use sk_test_ for testing or sk_live_ for real payments",
                      link: null,
                    },
                    {
                      step: "3",
                      text: "Click Save",
                      sub: "Checkout activates instantly for all users",
                      link: null,
                    },
                  ].map(({ step, text, sub, link }) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-[10px] font-bold shrink-0 mt-0.5">
                        {step}
                      </span>
                      <div>
                        <span className="text-xs text-foreground/80 font-medium">
                          {text}
                        </span>
                        {link ? (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1.5 text-[10px] text-gold/60 hover:text-gold inline-flex items-center gap-0.5 transition-colors"
                          >
                            {sub} <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {sub}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div
                className="glass-card rounded-xl p-6 space-y-6"
                data-ocid="admin.card"
              >
                <div className="space-y-2">
                  <Label className="text-gold/70 text-xs tracking-widest">
                    SECRET KEY
                  </Label>
                  <Input
                    type="password"
                    value={stripeKey}
                    onChange={(e) => setStripeKey(e.target.value)}
                    placeholder="sk_live_... or sk_test_..."
                    className="bg-black/40 border-gold/30 focus:border-gold font-mono text-sm"
                    data-ocid="admin.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gold/70 text-xs tracking-widest">
                    ALLOWED COUNTRIES (comma-separated)
                  </Label>
                  <Input
                    value={stripeCountries}
                    onChange={(e) => setStripeCountries(e.target.value)}
                    className="bg-black/40 border-gold/30 focus:border-gold"
                    data-ocid="admin.input"
                  />
                </div>
                <Button
                  onClick={handleSaveStripe}
                  disabled={savingStripe || !stripeKey}
                  className="w-full bg-gold hover:bg-gold-bright text-black font-bold tracking-widest gap-2"
                  data-ocid="admin.submit_button"
                >
                  {savingStripe ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  SAVE STRIPE CONFIG
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
