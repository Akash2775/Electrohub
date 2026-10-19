import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Zap,
  Search,
  User,
  ShoppingCart,
  Menu,
  X,
  Heart,
  ArrowRight,
  ImageOff,
  Bell,
  Check,
  Package,
  Headphones,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  MapPin,
  Smartphone,
  Laptop,
  Tv,
  Gamepad2,
  Camera,
  Watch,
  Cpu,
  Router,
  Speaker,
  Home,
  Percent,
  MoreVertical,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../../context/StoreContext";
import { money, message } from "../../utils/format";
import { api, post, upload, uploadMany, uploadVideo } from "../../services/api";

function Logo({ compact = false, textOnly = false }) {
  return <Link className={`logo marketplace-logo${compact ? " compact" : ""}${textOnly ? " admin-logo" : ""}`} to="/">
      {!textOnly && <span className="marketplace-logo-mark"><Zap size={compact ? 18 : 22} fill="currentColor" /></span>}
      <span className="marketplace-logo-copy">
        <b>ElectroHub</b>
        {!compact && <small>Explore electronics <em>+</em></small>}
      </span>
    </Link>;
}

function Photo({ src, alt, ...props }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return failed ? <div className="image-missing" role="img" aria-label={alt}>
      <ImageOff />
      <span>Image unavailable</span>
    </div> : <img src={src} alt={alt} onError={() => setFailed(true)} {...props} />;
}

function NotificationBell() {
  const s = useStore();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  async function load() {
    if (!s.user || s.user.role !== "CUSTOMER") return;
    try {
      const [list, count] = await Promise.all([
        api("/notifications"),
        api("/notifications/unread-count")
      ]);
      setItems(list);
      setUnread(count.count);
    } catch {
      // Notification failure should not block storefront navigation.
    }
  }
  useEffect(() => {
    if (!s.user || s.user.role !== "CUSTOMER") return;
    load();
    const timer = window.setInterval(load, 3e4);
    return () => window.clearInterval(timer);
  }, [s.user?.id]);
  if (!s.user || s.user.role !== "CUSTOMER") return null;
  return <div className="notification-wrap marketplace-action-wrap">
      <button className="marketplace-icon-action" aria-label="Notifications" onClick={() => {
        setOpen(!open);
        if (!open) load();
      }}>
        <Bell size={19} />
        {unread > 0 && <span className="header-count-badge">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && <div className="notification-panel glass-card marketplace-popover">
          <div className="notification-head">
            <strong>Notifications</strong>
            {unread > 0 && <button
              className="text-button"
              onClick={async () => {
                await api("/notifications/read-all", { method: "PATCH" });
                setUnread(0);
                setItems((x) => x.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
              }}
            >
              <Check size={14} /> Mark all read
            </button>}
          </div>
          <div className="notification-list">
            {items.length === 0 ? <p className="muted">No notifications yet.</p> : items.slice(0, 12).map((n) => <Link
              key={n.id}
              to={n.link_url || "/account"}
              className={"notification-item " + (!n.read_at ? "unread" : "")}
              onClick={async () => {
                setOpen(false);
                if (!n.read_at) {
                  try {
                    await api("/notifications/" + n.id + "/read", { method: "PATCH" });
                  } catch {
                    // Ignore mark-read errors; the next refresh will reconcile state.
                  }
                  setUnread((v) => Math.max(0, v - 1));
                }
              }}
            >
              <strong>{n.title}</strong>
              <span>{n.message}</span>
              <small>{new Date(n.created_at).toLocaleString("en-IN")}</small>
            </Link>)}
          </div>
        </div>}
    </div>;
}

function ThemeToggle({ compact = false }) {
  const s = useStore();
  const dark = s.theme === "dark";
  return <button
    type="button"
    className={compact ? "theme-toggle compact" : "theme-toggle"}
    aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    title={dark ? "Light mode" : "Dark mode"}
    onClick={s.toggleTheme}
  >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
      {!compact && <span>{dark ? "Light" : "Dark"}</span>}
    </button>;
}

function AccountMenu() {
  const s = useStore();
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [loc.pathname, loc.search]);
  if (!s.user) {
    return <Link className="marketplace-account-trigger guest" aria-label="Sign in" to="/auth">
        <User size={18} /> <span>Login</span><ChevronDown size={14} />
      </Link>;
  }
  if (s.user.role === "ADMIN") {
    return <Link className="marketplace-account-trigger" aria-label="Admin dashboard" to="/admin">
        <User size={18} /><span>Admin</span>
      </Link>;
  }
  return <div className="account-menu-wrap marketplace-action-wrap">
      <button className="marketplace-account-trigger" aria-label="Account menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <User size={18} />
        <span>{(s.user.name || "Account").split(" ")[0]}</span>
        <ChevronDown size={14} />
      </button>
      {open && <div className="account-menu-panel glass-card marketplace-popover">
          <div className="account-menu-user">
            <small>Hello,</small>
            <strong>{s.user.name}</strong>
            <small>{s.user.email}</small>
          </div>
          <Link to="/account?tab=profile"><User size={17} /> My profile</Link>
          <Link to="/account?tab=orders"><Package size={17} /> Orders</Link>
          <Link to="/account?tab=saved"><Heart size={17} /> Wishlist</Link>
          <Link to="/account?tab=notifications"><Bell size={17} /> Notifications</Link>
          <Link to="/account?tab=support"><Headphones size={17} /> Customer care</Link>
          <button
            onClick={async () => {
              try {
                await s.logout();
                setOpen(false);
                nav("/");
              } catch (e) {
                toast.error(message(e));
              }
            }}
          ><LogOut size={17} /> Sign out</button>
        </div>}
    </div>;
}

const electronics = [
  ["Mobiles", "mobile", Smartphone],
  ["Laptops", "laptop", Laptop],
  ["TVs", "tv", Tv],
  ["Audio", "audio", Speaker],
  ["Gaming", "gaming", Gamepad2],
  ["Cameras", "camera", Camera],
  ["Wearables", "wearable", Watch],
  ["Computer Parts", "component", Cpu],
  ["Networking", "network", Router]
];

function Navbar() {
  const [open, setOpen] = useState(false), [q, setQ] = useState("");
  const s = useStore(), nav = useNavigate(), loc = useLocation();
  useEffect(() => setOpen(false), [loc]);
  const cartCount = s.cart.reduce((a, b) => a + b.quantity, 0);
  return <header className="store-header marketplace-header">
      <div className="marketplace-topstrip">
        <div className="container marketplace-topstrip-inner">
          <span className="delivery-location"><MapPin size={14} /> Delivery location <b>Set pincode</b></span>
          <span className="topstrip-promise"><ShieldCheck size={14} /> Genuine electronics · Secure payments</span>
        </div>
      </div>
      <div className="navbar marketplace-mainbar">
        <div className="container market-nav-inner">
          <Logo />
          <form
            className="search marketplace-search"
            onSubmit={(e) => {
              e.preventDefault();
              nav("/shop?q=" + encodeURIComponent(q));
            }}
          >
            <Search size={20} />
            <input
              aria-label="Search products"
              placeholder="Search for electronics, brands and more"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </form>
          <div className="nav-actions marketplace-nav-actions">
            <AccountMenu />
            <div className="marketplace-more-wrap marketplace-action-wrap">
              <button className="marketplace-more-button" type="button"><MoreVertical size={18} /><span>More</span></button>
              <div className="marketplace-more-menu marketplace-popover">
                <Link to="/account?tab=notifications"><Bell size={16}/> Notifications</Link>
                <Link to="/account?tab=support"><Headphones size={16}/> 24×7 Support</Link>
                <Link to="/about"><ShieldCheck size={16}/> Policies</Link>
                <span className="marketplace-theme-line"><ThemeToggle /><small>Appearance</small></span>
              </div>
            </div>
            <NotificationBell />
            <Link className="marketplace-cart-action" aria-label="Shopping cart" to="/cart">
              <span className="cart-icon-wrap"><ShoppingCart size={21} />{cartCount > 0 && <b className="header-count-badge">{cartCount > 99 ? "99+" : cartCount}</b>}</span>
              <span>Cart</span>
            </Link>
            <button
              className="marketplace-mobile-menu"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
      <nav className={open ? "electronics-subnav open" : "electronics-subnav"} aria-label="Electronics categories">
        <div className="container electronics-subnav-inner">
          <Link to="/" className="subnav-home"><Home size={16}/><span>For You</span></Link>
          {electronics.map(([name, query, Icon]) => <Link key={name} to={"/shop?q=" + encodeURIComponent(query)}><Icon size={16}/><span>{name}</span></Link>)}
          <Link to="/#deals"><Percent size={16}/><span>Top Offers</span></Link>
        </div>
      </nav>
    </header>;
}

function Footer() {
  return <footer className="marketplace-footer">
      <div className="container footer-grid">
        <div>
          <Logo compact />
          <p>Electronics-only marketplace for phones, laptops, TVs, audio, gaming, cameras and smart devices.</p>
          <small>Pune, Maharashtra · India</small>
        </div>
        <div>
          <h4>ABOUT</h4>
          <Link to="/about">About ElectroHub</Link>
          <Link to="/account?tab=support">Contact us</Link>
          <Link to="/about#privacy">Privacy</Link>
          <Link to="/about#terms">Terms</Link>
        </div>
        <div>
          <h4>HELP</h4>
          <Link to="/account?tab=orders">Payments</Link>
          <Link to="/about#shipping">Shipping</Link>
          <Link to="/about#returns">Cancellation & returns</Link>
          <Link to="/account?tab=support">Customer care</Link>
        </div>
        <div>
          <h4>CONSUMER</h4>
          <Link to="/account?tab=profile">Your account</Link>
          <Link to="/account?tab=orders">Track order</Link>
          <Link to="/account?tab=saved">Wishlist</Link>
          <span className="pay-label">Payments via Razorpay</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <small>© {new Date().getFullYear()} ElectroHub. Independent electronics marketplace.</small>
        <span>UPI · Cards · Netbanking</span>
      </div>
    </footer>;
}

function Layout({ children }) {
  return <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>;
}

function ProductCard({ p, compact = false }) {
  const s = useStore();
  const nav = useNavigate();
  const liked = s.likes.includes(p.id);
  const discount = p.original_price_paise > p.price_paise
    ? Math.round((1 - p.price_paise / p.original_price_paise) * 100)
    : 0;
  function add() {
    const n = s.cart.find((c) => c.productId === p.id)?.quantity || 0;
    if (n >= Math.min(p.stock, p.max_order_quantity || 10)) {
      toast.error("Maximum available quantity reached");
      return;
    }
    s.setQuantity(p.id, n + 1);
    toast.success(p.name + " added to cart");
  }
  function buyNow() {
    if (p.stock < 1) {
      toast.error("This product is currently out of stock");
      return;
    }
    if (s.user?.role === "ADMIN") {
      toast.error("Use a customer account to place an order");
      return;
    }
    const target = "/buy-now/" + p.id;
    nav(s.user ? target : "/auth?next=" + encodeURIComponent(target));
  }
  return <article className={compact ? "product-card marketplace-product-card compact" : "product-card marketplace-product-card"}>
      <div className="product-image marketplace-product-image">
        {p.badge && <span className="badge">{p.badge}</span>}
        <button
          className={"heart marketplace-heart " + (liked ? "liked" : "")}
          onClick={() => s.toggleLike(p.id)}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={liked}
        >
          <Heart size={19} fill={liked ? "currentColor" : "none"}/>
        </button>
        <Link to={"/product/" + p.id}>
          <Photo src={p.image_url} alt={p.name} loading="lazy" />
        </Link>
      </div>
      <div className="product-content marketplace-product-content">
        <small className="sponsored-label">ElectroHub choice</small>
        <Link className="product-title" to={"/product/" + p.id}>{p.name}</Link>
        {(p.brand || p.model_number) && <small className="marketplace-model-line">{p.brand || "ElectroHub"}{p.model_number ? ` · ${p.model_number}` : ""}</small>}
        <div className="market-product-highlights">
          <span>{p.category_name}</span>
          {p.stock > 0 && <span>{p.stock < 5 ? `Only ${p.stock} left` : "In stock"}</span>}
        </div>
        <div className="market-meta-row">
          {Number(p.average_rating || 0) > 0 && <span className="market-rating">{Number(p.average_rating).toFixed(1)} ★</span>}
          {Number(p.review_count || 0) > 0 && <small>({p.review_count})</small>}
          <span className="verified-chip">Verified</span>
        </div>
        <div className="price marketplace-price">
          <strong>{money(p.price_paise)}</strong>
          {p.original_price_paise > p.price_paise && <del>{money(p.original_price_paise)}</del>}
          {discount > 0 && <span className="market-discount">{discount}% off</span>}
        </div>
        <small className="market-delivery">Free delivery</small>
        <div className="product-purchase-actions marketplace-card-actions">
          <button className="quick-cart" disabled={p.stock < 1 || s.user?.role === "ADMIN"} onClick={add}>
            <ShoppingCart size={15}/> Add to cart
          </button>
          <button className="quick-buy" disabled={p.stock < 1 || s.user?.role === "ADMIN"} onClick={buyNow}>
            Buy now
          </button>
        </div>
      </div>
    </article>;
}

function Loading() {
  return <div className="state" role="status">
      <div className="spinner" />
      Loading your store…
    </div>;
}
function ErrorState({ error, retry }) {
  return <div className="state">
      <h3>Could not load this page</h3>
      <p>{error}</p>
      <button className="button" onClick={retry}>Try again</button>
    </div>;
}
function Empty({ title, children }) {
  return <div className="state">
      <ShoppingCart size={36} />
      <h3>{title}</h3>
      {children || <Link className="button" to="/shop">Explore products <ArrowRight size={16} /></Link>}
    </div>;
}

function Newsletter() {
  const [email, setEmail] = useState(""), [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await post("/newsletter", { email });
      toast.success(r.message);
      setEmail("");
    } catch (e2) {
      toast.error(message(e2));
    } finally {
      setBusy(false);
    }
  }
  return <section className="newsletter">
      <div className="container">
        <span className="pill">Stay in the loop</span>
        <h2>
          Join the <span className="gradient-text">ElectroHub</span> Community
        </h2>
        <p>Subscribe for product updates and store offers.</p>
        <form onSubmit={submit}>
          <input
    aria-label="Newsletter email"
    type="email"
    required
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Enter your email"
  />
          <button className="button" disabled={busy}>
            {busy ? "Saving\u2026" : "Subscribe"} <ArrowRight size={18} />
          </button>
        </form>
        <small>
          Read our <Link to="/about#privacy">privacy policy</Link>.{" "}
          <Link to="/unsubscribe">Unsubscribe</Link> anytime.
        </small>
      </div>
    </section>;
}
function MultiUploadField({
  onAdd,
  label = "Add product images",
  remaining = 8,
  onBusyChange
}) {
  const [busy, setBusy] = useState(false);
  return <label className="upload-field multi-upload-field">
      <span>{label} · select up to {remaining} JPG/PNG files, 5 MB each</span>
      <input
    type="file"
    accept="image/jpeg,image/png"
    multiple
    disabled={busy || remaining <= 0}
    onChange={async (e) => {
      const files = Array.from(e.target.files || []).slice(0, remaining);
      if (!files.length) return;
      setBusy(true);
      onBusyChange?.(true);
      try {
        const urls = await uploadMany(files);
        onAdd(urls);
        toast.success(`${urls.length} image${urls.length === 1 ? "" : "s"} uploaded`);
      } catch (err) {
        toast.error(message(err));
      } finally {
        setBusy(false);
        onBusyChange?.(false);
        e.target.value = "";
      }
    }}
  />
      {busy && <small role="status">Uploading selected images…</small>}
    </label>;
}
function VideoUploadField({ onAdd, remaining = 3, onBusyChange }) {
  const [busy, setBusy] = useState(false);
  return <label className="upload-field video-upload-field">
      <span>Product demo video · MP4 / WebM, up to 30 MB · {remaining} slot{remaining === 1 ? "" : "s"} left</span>
      <input
        type="file"
        accept="video/mp4,video/webm"
        disabled={busy || remaining <= 0}
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setBusy(true);
          onBusyChange?.(true);
          try {
            const url = await uploadVideo(f);
            onAdd(url);
            toast.success("Product video uploaded");
          } catch (err) {
            toast.error(message(err));
          } finally {
            setBusy(false);
            onBusyChange?.(false);
            e.target.value = "";
          }
        }}
      />
      {busy && <small role="status">Uploading video…</small>}
    </label>;
}

function UploadField({
  value,
  onChange,
  label = "Image",
  onBusyChange
}) {
  const [busy, setBusy] = useState(false);
  return <label className="upload-field">
      <span>{label} · JPG / PNG, up to 5 MB</span>
      {value && <Photo src={value} alt="Uploaded image preview" />}
      <input
    type="file"
    accept="image/jpeg,image/png"
    disabled={busy}
    onChange={async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      setBusy(true);
      onBusyChange?.(true);
      try {
        onChange(await upload(f));
        toast.success("Image uploaded");
      } catch (err) {
        toast.error(message(err));
      } finally {
        setBusy(false);
        onBusyChange?.(false);
        e.target.value = "";
      }
    }}
  />
      {busy && <small role="status">Uploading image…</small>}
    </label>;
}
export {
  Empty,
  ErrorState,
  Footer,
  Layout,
  Loading,
  Logo,
  MultiUploadField,
  Navbar,
  Newsletter,
  Photo,
  ProductCard,
  ThemeToggle,
  UploadField,
  VideoUploadField
};
