import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import MobileBottomNav from "./components/MobileBottomNav";
import CartSidebar from "./components/CartSidebar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Categories from "./pages/Categories";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Signup from "./pages/Signup";
import Deals from "./pages/Deals";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Track from "./pages/Track";
import Admin from "./pages/Admin";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";
import OrderSuccess from "./pages/OrderSuccess";
import { DataProvider } from "./context/DataContext";
import { Navigate, useLocation, useNavigationType } from "react-router-dom";
import { useData } from "./context/DataContext";
import { useEffect } from "react";
import FloatingVideo from "./components/FloatingVideo";
import "./App.css";
import Wishlist from "./pages/Wishlist";
import Search from "./pages/Search";
import Seller from "./pages/Seller";
import Returns from "./pages/Returns";
import Shipping from "./pages/Shipping";
import Faq from "./pages/Faq";
import WhatsAppWidget from "./components/WhatsAppWidget";
import Careers from "./pages/Careers";
import Press from "./pages/Press";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user } = useData();

  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && user.role !== "admin") return <Navigate to="/" replace />;

  return children;
};

const AdminRedirect = ({ children }) => {
  const { user } = useData();

  if (user && user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

const ScrollManager = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (navigationType !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [pathname, navigationType]);

  return null;
};

export default function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <DataProvider>
        <Navbar />
        <MobileBottomNav />
        <CartSidebar />
        <WhatsAppWidget />
        <FloatingVideo />
        <Routes>
          <Route
            path="/"
            element={
              <AdminRedirect>
                <Home />
              </AdminRedirect>
            }
          />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/cart" element={<Navigate to="/checkout" replace />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/search" element={<Search />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Signup />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/track" element={<Track />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="/order-success" element={<OrderSuccess />} />

          {}
          <Route path="/seller" element={<Seller />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/press" element={<Press />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />

          {}
          <Route
            path="*"
            element={
              <main
                style={{
                  minHeight: "60vh",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <h1
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "2rem",
                    color: "var(--gray-700)",
                  }}
                >
                  404 – Page Not Found
                </h1>
                <a
                  href="/"
                  style={{ color: "var(--primary)", fontWeight: 600 }}
                >
                  ← Back to Home
                </a>
              </main>
            }
          />
        </Routes>
        <Footer />
      </DataProvider>
    </BrowserRouter>
  );
}
