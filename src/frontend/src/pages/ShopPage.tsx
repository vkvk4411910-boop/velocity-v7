import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useTheme } from "../context/ThemeContext";
import { useProducts } from "../hooks/useQueries";
import { useCartStore } from "../store/cartStore";

const SAMPLE_PRODUCTS = [
  {
    id: "sample-1",
    name: "V7 Velocity Jacket",
    description:
      "Carbon fiber reinforced racing jacket with aerodynamic paneling and thermal regulation.",
    priceCents: 29900,
    category: "Apparel",
    imageUrl: "/assets/generated/product-male-bomber-jacket.dim_600x600.jpg",
    stock: 15,
    gender: "Male",
  },
  {
    id: "sample-2",
    name: "V7 Speed Helmet",
    description:
      "FIA-certified composite helmet with integrated ventilation and gold-tinted visor.",
    priceCents: 45900,
    category: "Gear",
    imageUrl: "/assets/generated/product-male-hoodie.dim_600x600.jpg",
    stock: 8,
    gender: "Male",
  },
  {
    id: "sample-3",
    name: "V7 Carbon Gloves",
    description:
      "Precision-fit racing gloves with carbon knuckle reinforcement and tactile grip.",
    priceCents: 8900,
    category: "Gear",
    imageUrl:
      "/assets/generated/product-male-compression-shirt.dim_600x600.jpg",
    stock: 30,
    gender: "Male",
  },
  {
    id: "sample-4",
    name: "V7 Track Pants",
    description:
      "Lightweight track pants with stretch articulation and gold accent stripe.",
    priceCents: 14900,
    category: "Apparel",
    imageUrl: "/assets/generated/product-male-joggers.dim_600x600.jpg",
    stock: 20,
    gender: "Male",
  },
  {
    id: "sample-5",
    name: "V7 Racing Boots",
    description:
      "High-ankle racing boots with titanium buckle system and fire-resistant lining.",
    priceCents: 38900,
    category: "Footwear",
    imageUrl: "/assets/generated/product-male-sneakers.dim_600x600.jpg",
    stock: 12,
    gender: "Male",
  },
  {
    id: "sample-6",
    name: "V7 Aerodynamic Vest",
    description:
      "Wind-tunnel tested aerodynamic vest reducing drag by 18% at race speed.",
    priceCents: 21900,
    category: "Apparel",
    imageUrl: "/assets/generated/product-male-cargo-pants.dim_600x600.jpg",
    stock: 18,
    gender: "Male",
  },
];

const FEMALE_PRODUCTS = [
  {
    id: "female-1",
    name: "V7 Cropped Bomber Jacket",
    description:
      "Fitted cropped bomber jacket in jet black with rose-gold zipper details and embroidered V7 logo.",
    priceCents: 27900,
    category: "Apparel",
    imageUrl: "/assets/generated/product-female-bomber-jacket.dim_600x600.jpg",
    stock: 14,
    gender: "Female",
  },
  {
    id: "female-2",
    name: "V7 High-Waist Leggings",
    description:
      "Compression-fit high-waist leggings with pink side stripe, four-way stretch, and V7 logo band.",
    priceCents: 12900,
    category: "Apparel",
    imageUrl: "/assets/generated/product-female-leggings.dim_600x600.jpg",
    stock: 28,
    gender: "Female",
  },
  {
    id: "female-3",
    name: "V7 Performance Sports Bra",
    description:
      "High-support sports bra with rose-gold accent band, mesh paneling, and V7 logo detail.",
    priceCents: 7900,
    category: "Apparel",
    imageUrl: "/assets/generated/product-female-sports-bra.dim_600x600.jpg",
    stock: 32,
    gender: "Female",
  },
  {
    id: "female-4",
    name: "V7 Street Sneakers",
    description:
      "Bold platform sneakers in black and pink with chunky sole, padded collar, and V7 side logo.",
    priceCents: 34900,
    category: "Footwear",
    imageUrl: "/assets/generated/product-female-sneakers.dim_600x600.jpg",
    stock: 18,
    gender: "Female",
  },
  {
    id: "female-5",
    name: "V7 Zip Athletic Vest",
    description:
      "Sleeveless zip-up hoodie vest with pink trim, kangaroo pocket, and V7 chest logo patch.",
    priceCents: 17900,
    category: "Apparel",
    imageUrl: "/assets/generated/product-female-zip-vest.dim_600x600.jpg",
    stock: 20,
    gender: "Female",
  },
  {
    id: "female-6",
    name: "V7 Fashion Gloves",
    description:
      "Fingerless leather gloves with rose-gold stud accents, padded palm grip, and V7 wrist stamp.",
    priceCents: 6900,
    category: "Gear",
    imageUrl: "/assets/generated/product-female-gloves.dim_600x600.jpg",
    stock: 22,
    gender: "Female",
  },
];

const CATEGORIES = ["All", "Apparel", "Gear", "Footwear"];

type DisplayProduct = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  category: string;
  imageUrl: string;
  stock: number;
  gender: string;
};

export function ShopPage() {
  const [category, setCategory] = useState("All");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const { data: backendProducts, isLoading } = useProducts();
  const { addItem, openCart } = useCartStore();
  const { isDayMode } = useTheme();

  const backendMapped: DisplayProduct[] = (backendProducts || []).map((p) => ({
    id: p.id.toString(),
    name: p.name,
    description: p.description,
    priceCents: Number(p.priceCents),
    category: p.category,
    imageUrl:
      p.imageUrl ||
      "/assets/generated/product-male-bomber-jacket.dim_600x600.jpg",
    stock: Number(p.stock),
    gender: "Male",
  }));

  const maleProducts: DisplayProduct[] =
    backendMapped.length > 0 ? backendMapped : SAMPLE_PRODUCTS;
  const femaleProducts: DisplayProduct[] = FEMALE_PRODUCTS;

  const activeProducts = gender === "Male" ? maleProducts : femaleProducts;
  const filtered =
    category === "All"
      ? activeProducts
      : activeProducts.filter((p) => p.category === category);

  function handleAddToCart(p: DisplayProduct) {
    addItem({
      productId: p.id,
      quantity: 1,
      name: p.name,
      priceCents: p.priceCents,
      imageUrl: p.imageUrl,
    });
    toast.success(`${p.name} added to cart`, {
      action: { label: "View Cart", onClick: openCart },
    });
  }

  const maleTabStyle = {
    active: isDayMode
      ? { background: "#1a8abb", color: "#fff", borderColor: "#1a8abb" }
      : { background: "#C9A84C", color: "#000", borderColor: "#C9A84C" },
    inactive: isDayMode
      ? {
          background: "transparent",
          color: "rgba(30,80,120,0.6)",
          borderColor: "rgba(30,80,120,0.2)",
        }
      : {
          background: "transparent",
          color: "rgba(201,168,76,0.6)",
          borderColor: "rgba(201,168,76,0.25)",
        },
  };

  const femaleTabStyle = {
    active: { background: "#d6658a", color: "#fff", borderColor: "#d6658a" },
    inactive: isDayMode
      ? {
          background: "transparent",
          color: "rgba(160,60,100,0.6)",
          borderColor: "rgba(200,100,140,0.25)",
        }
      : {
          background: "transparent",
          color: "rgba(214,101,138,0.6)",
          borderColor: "rgba(214,101,138,0.25)",
        },
  };

  const catBtnStyle = (active: boolean) => {
    if (gender === "Female") {
      return active
        ? "bg-pink-600 text-white border-pink-600"
        : "border-pink-400/40 text-pink-500/60 hover:border-pink-500/60 hover:text-pink-500";
    }
    return isDayMode
      ? active
        ? "bg-sky-500 text-white border-sky-500"
        : "border-sky-300/40 text-sky-700/60 hover:border-sky-400/60 hover:text-sky-700"
      : active
        ? "bg-gold text-black border-gold"
        : "border-gold/25 text-gold/60 hover:border-gold/50 hover:text-gold";
  };

  return (
    <main className="min-h-screen pt-24 pb-20 px-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p className="text-xs tracking-[0.4em] font-semibold mb-2 uppercase">
            <span
              style={{
                color:
                  gender === "Female"
                    ? "#d6658a"
                    : isDayMode
                      ? "#1a8abb"
                      : "#C9A84C",
              }}
            >
              {gender === "Female"
                ? "Women's Collection"
                : "Premium Collection"}
            </span>
          </p>
          <h1
            className="font-display text-6xl tracking-widest"
            style={{
              background:
                gender === "Female"
                  ? "linear-gradient(135deg, #a0203e, #d6658a, #a0203e)"
                  : isDayMode
                    ? "linear-gradient(135deg, #1a6ea0, #60C8E8, #1a6ea0)"
                    : "linear-gradient(135deg, #c9a84c, #ffd700, #c9a84c)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            THE SHOP
          </h1>
        </motion.div>

        {/* Gender Tabs */}
        <div className="flex items-center gap-3 mb-6" data-ocid="shop.section">
          <button
            type="button"
            onClick={() => setGender("Male")}
            data-ocid="shop.tab"
            className="px-6 py-2 rounded-full text-sm font-bold tracking-widest transition-all border"
            style={
              gender === "Male" ? maleTabStyle.active : maleTabStyle.inactive
            }
          >
            ♂ MALE
          </button>
          <button
            type="button"
            onClick={() => setGender("Female")}
            data-ocid="shop.tab"
            className="px-6 py-2 rounded-full text-sm font-bold tracking-widest transition-all border"
            style={
              gender === "Female"
                ? femaleTabStyle.active
                : femaleTabStyle.inactive
            }
          >
            ♀ FEMALE
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-3 mb-10 flex-wrap">
          <Filter
            className="w-4 h-4"
            style={{
              color:
                gender === "Female"
                  ? "rgba(214,101,138,0.6)"
                  : isDayMode
                    ? "rgba(30,80,120,0.5)"
                    : "rgba(201,168,76,0.6)",
            }}
          />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded text-sm font-semibold tracking-widest transition-all border ${catBtnStyle(category === cat)}`}
              data-ocid="shop.tab"
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="glass-card rounded-xl h-96 animate-pulse"
                data-ocid="shop.loading_state"
              />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            layout
          >
            {filtered.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                layout
                className="rounded-xl overflow-hidden group"
                style={{
                  background: isDayMode
                    ? "rgba(255,245,250,0.92)"
                    : "rgba(255,255,255,0.03)",
                  backdropFilter: "blur(12px)",
                  border:
                    gender === "Female"
                      ? isDayMode
                        ? "1px solid rgba(214,101,138,0.35)"
                        : "1px solid rgba(214,101,138,0.2)"
                      : isDayMode
                        ? "1px solid rgba(96,200,232,0.25)"
                        : "1px solid rgba(201,168,76,0.15)",
                  transition: "border-color 0.3s, background-color 0.3s",
                }}
                data-ocid={`shop.item.${idx + 1}`}
              >
                <div className="relative overflow-hidden h-64">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        gender === "Female"
                          ? "linear-gradient(to top, rgba(90,10,40,0.55), transparent)"
                          : "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                    }}
                  />
                  <Badge
                    className="absolute top-3 right-3 text-[10px] tracking-widest"
                    style={{
                      background:
                        gender === "Female"
                          ? "rgba(214,101,138,0.2)"
                          : "rgba(201,168,76,0.2)",
                      color: gender === "Female" ? "#f0a0c0" : "#C9A84C",
                      borderColor:
                        gender === "Female"
                          ? "rgba(214,101,138,0.45)"
                          : "rgba(201,168,76,0.3)",
                    }}
                  >
                    {product.category.toUpperCase()}
                  </Badge>
                </div>
                <div className="p-5 space-y-3">
                  <h3
                    className="font-display text-lg tracking-wider"
                    style={{
                      color:
                        gender === "Female"
                          ? isDayMode
                            ? "#7a1535"
                            : "#f0a0c0"
                          : isDayMode
                            ? "#1a3a5c"
                            : undefined,
                    }}
                  >
                    {product.name}
                  </h3>
                  <p
                    className="text-xs leading-relaxed line-clamp-2"
                    style={{
                      color: isDayMode
                        ? gender === "Female"
                          ? "rgba(100,30,60,0.65)"
                          : "rgba(40,80,120,0.65)"
                        : undefined,
                    }}
                  >
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <span
                      className="font-display text-2xl"
                      style={{
                        background:
                          gender === "Female"
                            ? "linear-gradient(135deg, #a0203e, #d6658a, #a0203e)"
                            : isDayMode
                              ? "linear-gradient(135deg, #1a6ea0, #60C8E8, #1a6ea0)"
                              : "linear-gradient(135deg, #c9a84c, #ffd700, #c9a84c)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      ₹{(product.priceCents / 100).toFixed(0)}
                    </span>
                    <Button
                      size="sm"
                      className="font-bold gap-2 tracking-wider"
                      style={
                        gender === "Female"
                          ? {
                              background:
                                "linear-gradient(135deg, #a0203e, #d6658a)",
                              color: "#fff",
                              border: "none",
                            }
                          : {}
                      }
                      onClick={() => handleAddToCart(product)}
                      data-ocid={`shop.item.${idx + 1}`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> ADD
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-24" data-ocid="shop.empty_state">
            <p className="text-muted-foreground">
              No products in this category.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
