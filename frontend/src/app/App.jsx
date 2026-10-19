import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link
} from "react-router-dom";
import { Toaster } from "sonner";
import { StoreProvider, useStore } from "../context/StoreContext";
import { Home, Shop, ProductDetails, About } from "../pages/store/StorePages";
import { Auth, Account, OrderDetails, Unsubscribe } from "../pages/account/Account";
import { BuyNow, Cart } from "../pages/checkout/Checkout";
import Admin from "../pages/admin/Admin";
import { Loading, Layout } from "../components/common/SharedComponents";
function Guard({
  admin = false,
  children
}) {
  const s = useStore();
  if (s.loading) return <Loading />;
  if (!s.user) return <Navigate to="/auth" replace />;
  if (admin && s.user.role !== "ADMIN")
    return <Navigate to="/account" replace />;
  if (!admin && s.user.role === "ADMIN")
    return <Navigate to="/admin" replace />;
  return children;
}
function Scroll() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const timer = setTimeout(
        () => document.getElementById(hash.slice(1))?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"
        }),
        100
      );
      return () => clearTimeout(timer);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}
function ThemeToaster() {
  const s = useStore();
  return <Toaster theme={s.theme} richColors position="top-right" />;
}
function App() {
  return <StoreProvider>
      <BrowserRouter>
        <Scroll />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/buy-now/:id" element={<BuyNow />} />
          <Route path="/auth" element={<Auth />} />
          <Route
    path="/account"
    element={<Guard>
                <Account />
              </Guard>}
  />
          <Route
    path="/account/orders/:id"
    element={<Guard>
                <OrderDetails />
              </Guard>}
  />
          <Route
    path="/admin"
    element={<Guard admin>
                <Admin />
              </Guard>}
  />
          <Route path="/about" element={<About />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route
    path="*"
    element={<Layout>
                <div className="state">
                  <h1>Page not found</h1>
                  <Link className="button" to="/">
                    Back to store
                  </Link>
                </div>
              </Layout>}
  />
        </Routes>
        <ThemeToaster />
      </BrowserRouter>
    </StoreProvider>;
}
export { App };
