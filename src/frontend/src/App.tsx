import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { CartSidebar } from "./components/CartSidebar";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { ThemeProvider } from "./context/ThemeContext";
import { AdminPage } from "./pages/AdminPage";
import { CheckoutCancelPage } from "./pages/CheckoutCancelPage";
import { CheckoutSuccessPage } from "./pages/CheckoutSuccessPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HomePage } from "./pages/HomePage";
import { ShopPage } from "./pages/ShopPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <CartSidebar />
      {children}
      <Footer />
    </div>
  );
}

const rootRoute = createRootRoute();

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <Layout>
      <HomePage />
    </Layout>
  ),
});

const shopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shop",
  component: () => (
    <Layout>
      <ShopPage />
    </Layout>
  ),
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: () => (
    <Layout>
      <ShopPage />
    </Layout>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => (
    <Layout>
      <DashboardPage />
    </Layout>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => (
    <Layout>
      <AdminPage />
    </Layout>
  ),
});

const checkoutSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout/success",
  component: () => (
    <Layout>
      <CheckoutSuccessPage />
    </Layout>
  ),
});

const checkoutCancelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout/cancel",
  component: () => (
    <Layout>
      <CheckoutCancelPage />
    </Layout>
  ),
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  shopRoute,
  cartRoute,
  dashboardRoute,
  adminRoute,
  checkoutSuccessRoute,
  checkoutCancelRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
