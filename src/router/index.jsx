import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "@/components/organisms/Layout";

// Lazy load components
const Home = lazy(() => import("@/components/pages/Home"));
const ProductDetail = lazy(() => import("@/components/pages/ProductDetail"));
const Cart = lazy(() => import("@/components/pages/Cart"));
const Checkout = lazy(() => import("@/components/pages/Checkout"));
const VirtualTryOn = lazy(() => import("@/components/pages/VirtualTryOn"));
const NotFound = lazy(() => import("@/components/pages/NotFound"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-surface">
    <div className="text-center space-y-4">
      <svg className="animate-spin h-12 w-12 text-accent mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p className="text-primary font-medium">Loading VisionHub...</p>
    </div>
  </div>
);

const mainRoutes = [
  {
    path: "",
    index: true,
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Home />
      </Suspense>
    )
  },
  {
    path: "product/:id",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProductDetail />
      </Suspense>
    )
  },
  {
    path: "cart",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Cart />
      </Suspense>
    )
  },
  {
    path: "checkout",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Checkout />
      </Suspense>
    )
  },
  {
    path: "virtual-try-on",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <VirtualTryOn />
      </Suspense>
    )
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <NotFound />
      </Suspense>
    )
  }
];

const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [...mainRoutes]
  }
];

export const router = createBrowserRouter(routes);