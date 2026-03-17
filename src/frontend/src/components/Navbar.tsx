import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Moon,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Sun,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";
import { useCartStore } from "../store/cartStore";

const NAV_ITEMS = [
  { label: "HOME", path: "/", Icon: Home },
  { label: "SHOP", path: "/shop", Icon: ShoppingBag },
  { label: "CART", path: "/cart", Icon: ShoppingCart },
  { label: "ME", path: "/dashboard", Icon: LayoutDashboard },
];

export function Navbar() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" || !!identity;
  const cartStore = useCartStore();
  const cartCount = cartStore.totalItems();
  const { data: isAdmin } = useIsAdmin();
  const { isDayMode, toggleTheme } = useTheme();

  const gold = isDayMode ? "#1a6ea0" : "#C9A84C";
  const textMuted = isDayMode
    ? "rgba(30,80,120,0.55)"
    : "rgba(201,168,76,0.55)";

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-3"
      style={{
        background: isDayMode
          ? "rgba(255,255,255,0.93)"
          : "rgba(10,10,10,0.87)",
        backdropFilter: "blur(20px)",
        borderBottom: isDayMode
          ? "1px solid rgba(168,216,234,0.4)"
          : "1px solid rgba(201,168,76,0.15)",
        boxShadow: isDayMode ? "0 2px 16px rgba(100,180,220,0.1)" : undefined,
      }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3" data-ocid="nav.link">
        {/* Flat hexagonal V7 badge */}
        <div
          style={{
            width: 42,
            height: 42,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px",
            background: isDayMode
              ? "linear-gradient(135deg,#1a6ea0,#60C8E8)"
              : "linear-gradient(135deg,#C9A84C,#FFD700)",
            boxShadow: isDayMode
              ? "0 0 14px rgba(96,200,232,0.4)"
              : "0 0 14px rgba(201,168,76,0.45)",
          }}
        >
          <span
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "18px",
              color: isDayMode ? "#fff" : "#000",
              fontWeight: 900,
              letterSpacing: "0.04em",
            }}
          >
            V7
          </span>
        </div>
        <span
          className="font-display text-2xl tracking-widest hidden sm:block"
          style={{
            lineHeight: 1,
            background: isDayMode
              ? "linear-gradient(135deg, #1a6ea0, #60C8E8, #1a6ea0)"
              : "linear-gradient(135deg, #c9a84c, #ffd700, #c9a84c)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          VELOCITY V7
        </span>
      </Link>

      {/* Nav items — flat icon + label */}
      <div className="flex items-center gap-1 md:gap-2">
        {NAV_ITEMS.map(({ label, path, Icon }) => (
          <div key={path} className="relative">
            <Link to={path} data-ocid="nav.link">
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
                style={{ color: gold }}
              >
                <Icon className="w-[18px] h-[18px]" style={{ color: gold }} />
                <span
                  className="text-[9px] font-semibold tracking-widest hidden md:block"
                  style={{ color: textMuted }}
                >
                  {label}
                </span>
              </motion.div>
            </Link>
            {label === "CART" && cartCount > 0 && (
              <Badge
                className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[9px] text-black border-0 font-bold"
                style={{ background: gold }}
                data-ocid="nav.cart.badge"
              >
                {cartCount}
              </Badge>
            )}
          </div>
        ))}

        {isAdmin && (
          <Link to="/admin" data-ocid="nav.admin.link">
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg cursor-pointer"
              style={{ color: gold }}
            >
              <Settings className="w-[18px] h-[18px]" style={{ color: gold }} />
              <span
                className="text-[9px] font-semibold tracking-widest hidden md:block"
                style={{ color: textMuted }}
              >
                ADMIN
              </span>
            </motion.div>
          </Link>
        )}

        {/* Day/Night toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          data-ocid="nav.toggle"
          className="flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 ml-1"
          style={{
            background: isDayMode
              ? "rgba(96,200,232,0.15)"
              : "rgba(201,168,76,0.12)",
            borderColor: isDayMode
              ? "rgba(96,200,232,0.5)"
              : "rgba(201,168,76,0.35)",
            color: isDayMode ? "#1a8abb" : "#C9A84C",
          }}
          title={isDayMode ? "Switch to Night Mode" : "Switch to Day Mode"}
        >
          {isDayMode ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Auth */}
      <div className="flex items-center gap-2">
        <AnimatePresence mode="wait">
          {isLoggedIn ? (
            <motion.div
              key="logout"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={clear}
                className="gap-2"
                style={{
                  borderColor: isDayMode
                    ? "rgba(30,140,180,0.4)"
                    : "rgba(201,168,76,0.3)",
                  color: isDayMode ? "#1a6ea0" : "#C9A84C",
                }}
                data-ocid="nav.logout_button"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Button
                size="sm"
                onClick={login}
                disabled={loginStatus === "logging-in"}
                className="font-semibold gap-2"
                style={{
                  background: isDayMode ? "#1a8abb" : undefined,
                  backgroundColor: isDayMode ? "#1a8abb" : undefined,
                }}
                data-ocid="nav.login_button"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {loginStatus === "logging-in" ? "Signing in..." : "Sign In"}
                </span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
