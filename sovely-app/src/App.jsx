import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
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
import { DataProvider } from "./context/DataContext";
import { Navigate } from "react-router-dom";
import { useData } from "./context/DataContext";
import "./App.css";
import Wishlist from "./pages/Wishlist";
import Search from "./pages/Search";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user } = useData();

  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && user.role !== "admin") return <Navigate to="/" replace />;

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <Navbar />
        <CartSidebar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/search" element={<Search />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
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
