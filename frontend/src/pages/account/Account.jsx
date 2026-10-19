import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams
} from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  LogOut,
  Package,
  User,
  Bell,
  Headphones,
  Search,
  Send,
  Home,
  MapPin,
  CreditCard,
  Download,
  MessageCircle,
  Copy,
  Truck,
  PackageCheck,
  Clock3
} from "lucide-react";
import { toast } from "sonner";
import {
  Layout,
  Logo,
  Loading,
  ErrorState,
  Empty,
  Photo,
  ProductCard
} from "../../components/common/SharedComponents";
import { useStore } from "../../context/StoreContext";
import { useData } from "../../hooks/useData";
import { api, post } from "../../services/api";
import { money, message } from "../../utils/format";
function Auth() {
  const s = useStore(), nav = useNavigate(), [params] = useSearchParams();
  const [register, setRegister] = useState(false), [mode, setMode] = useState("PASSWORD"), [channel, setChannel] = useState("EMAIL"), [otpSent, setOtpSent] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [registration, setRegistration] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    otp: "",
    emailOtp: "",
    mobileOtp: ""
  });
  if (s.loading) return <Loading />;
  const requested = params.get("next");
  const customerTarget = requested === "cart"
    ? "/cart"
    : requested?.startsWith("/")
      ? requested
      : "/account";
  if (s.user)
    return <Navigate to={s.user.role === "ADMIN" ? "/admin" : customerTarget} replace />;
  function go(u) {
    toast.success("Welcome" + (u.name ? ", " + u.name : "") + "!");
    nav(u.role === "ADMIN" ? "/admin" : customerTarget, { replace: true });
  }
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (register) {
        const r = await s.startRegistration(form.name, form.email, form.phone, form.password);
        setRegistration({
          registrationId: r.registrationId,
          email: r.email,
          phone: r.phone,
          emailVerified: r.emailVerified,
          phoneVerified: r.phoneVerified
        });
        toast.success("OTP sent to your email and mobile");
      } else if (mode === "OTP") {
        const destination = channel === "EMAIL" ? form.email : form.phone;
        if (!otpSent) {
          toast.success(await s.requestOtp(channel, destination));
          setOtpSent(true);
        } else {
          go(await s.verifyOtp(channel, destination, form.otp));
        }
      } else {
        go(await s.login(form.email, form.password));
      }
    } catch (e2) {
      setError(message(e2));
    } finally {
      setBusy(false);
    }
  }
  async function verifySignup(channel2) {
    if (!registration) return;
    const code = channel2 === "EMAIL" ? form.emailOtp : form.mobileOtp;
    if (!code) {
      setError("Enter the OTP first");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await s.verifyRegistration(registration.registrationId, channel2, code);
      setRegistration((r) => r ? {
        ...r,
        emailVerified: result.emailVerified,
        phoneVerified: result.phoneVerified
      } : r);
      if (result.complete && result.user) {
        toast.success("Email and mobile verified. Account created!");
        go(result.user);
      } else {
        toast.success(channel2 === "EMAIL" ? "Email verified" : "Mobile verified");
      }
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  async function resendSignup(channel2) {
    if (!registration) return;
    setBusy(true);
    setError("");
    try {
      toast.success(await s.resendRegistrationOtp(registration.registrationId, channel2));
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  return <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-wrap">
        <Link className="back" to="/">
          <ArrowLeft size={16} /> Back to Store
        </Link>
        <div className="glass-card auth-card">
          <Logo />
          <h1>{register ? "Create Verified Account" : "Welcome Back"}</h1>
          <p>
            {register ? "For account security, both your email and mobile number must be verified." : "Sign in securely to your account"}
          </p>

          {register && registration ? <div className="signup-verify">
              <div className={registration.emailVerified ? "verify-contact verified" : "verify-contact"}>
                <div>
                  <strong>Email verification</strong>
                  <small>{registration.email}</small>
                </div>
                {registration.emailVerified ? <span className="verify-ok">✓ Verified</span> : <>
                    <input
    aria-label="Email OTP"
    inputMode="numeric"
    autoComplete="one-time-code"
    pattern="[0-9]{4,8}"
    maxLength={8}
    value={form.emailOtp}
    onChange={(e) => setForm({ ...form, emailOtp: e.target.value.replace(/\D/g, "").slice(0, 8) })}
    placeholder="Email OTP"
  />
                    <div className="verify-actions">
                      <button className="button small" type="button" disabled={busy} onClick={() => verifySignup("EMAIL")}>Verify Email</button>
                      <button className="text-button" type="button" disabled={busy} onClick={() => resendSignup("EMAIL")}>Resend</button>
                    </div>
                  </>}
              </div>
              <div className={registration.phoneVerified ? "verify-contact verified" : "verify-contact"}>
                <div>
                  <strong>Mobile verification</strong>
                  <small>{registration.phone}</small>
                </div>
                {registration.phoneVerified ? <span className="verify-ok">✓ Verified</span> : <>
                    <input
    aria-label="Mobile OTP"
    inputMode="numeric"
    autoComplete="one-time-code"
    pattern="[0-9]{4,8}"
    maxLength={8}
    value={form.mobileOtp}
    onChange={(e) => setForm({ ...form, mobileOtp: e.target.value.replace(/\D/g, "").slice(0, 8) })}
    placeholder="Mobile OTP"
  />
                    <div className="verify-actions">
                      <button className="button small" type="button" disabled={busy} onClick={() => verifySignup("SMS")}>Verify Mobile</button>
                      <button className="text-button" type="button" disabled={busy} onClick={() => resendSignup("SMS")}>Resend</button>
                    </div>
                  </>}
              </div>
              <p className="muted signup-note">Your account is created only after both contacts are verified.</p>
              {error && <p className="error-text" role="alert">{error}</p>}
              <button
    type="button"
    className="text-button"
    disabled={busy}
    onClick={() => {
      setRegistration(null);
      setForm({ ...form, emailOtp: "", mobileOtp: "" });
      setError("");
    }}
  >
                Change signup details
              </button>
            </div> : <>
              {!register && <div className="auth-methods">
                  <button type="button" className={mode === "PASSWORD" ? "active" : ""} onClick={() => {
    setMode("PASSWORD");
    setOtpSent(false);
    setError("");
  }}>
                    Password
                  </button>
                  <button type="button" className={mode === "OTP" ? "active" : ""} onClick={() => {
    setMode("OTP");
    setOtpSent(false);
    setError("");
  }}>
                    OTP Login
                  </button>
                </div>}
              {mode === "OTP" && !register && <div className="auth-methods compact-methods">
                  <button type="button" className={channel === "EMAIL" ? "active" : ""} onClick={() => {
    setChannel("EMAIL");
    setOtpSent(false);
  }}>
                    Email OTP
                  </button>
                  <button type="button" className={channel === "SMS" ? "active" : ""} onClick={() => {
    setChannel("SMS");
    setOtpSent(false);
  }}>
                    Mobile OTP
                  </button>
                </div>}
              <form onSubmit={submit}>
                {register && <label>
                    Full name
                    <input autoComplete="name" required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </label>}
                {(register || mode === "PASSWORD" || channel === "EMAIL") && <label>
                    Email
                    <input type="email" autoComplete="username" required maxLength={254} value={form.email} onChange={(e) => {
    setForm({ ...form, email: e.target.value });
    setOtpSent(false);
  }} placeholder="you@example.com" />
                  </label>}
                {(register || mode === "OTP" && channel === "SMS") && <label>
                    Mobile number {register && <small className="muted">(required and OTP verified)</small>}
                    <input inputMode="numeric" autoComplete="tel" required pattern="[6-9][0-9]{9}" maxLength={10} value={form.phone} onChange={(e) => {
    setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) });
    setOtpSent(false);
  }} placeholder="9876543210" />
                  </label>}
                {(register || mode === "PASSWORD") && <label>
                    Password
                    <input type="password" autoComplete={register ? "new-password" : "current-password"} required minLength={register ? 10 : 1} maxLength={72} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={register ? "At least 10 characters" : "Enter your password"} />
                  </label>}
                {mode === "OTP" && !register && otpSent && <label>
                    One-time code
                    <input inputMode="numeric" autoComplete="one-time-code" required pattern="[0-9]{4,8}" maxLength={8} value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, "").slice(0, 8) })} placeholder="6-digit OTP" />
                  </label>}
                {error && <p className="error-text" role="alert">{error}</p>}
                <button className="button full" disabled={busy}>
                  {busy ? "Please wait\u2026" : register ? "Send Email & Mobile OTP" : mode === "OTP" ? otpSent ? "Verify & Sign In" : "Send OTP" : "Sign In"}
                </button>
                {mode === "OTP" && otpSent && !register && <button type="button" className="text-button" disabled={busy} onClick={() => {
    setOtpSent(false);
    setForm({ ...form, otp: "" });
  }}>
                    Change email/mobile or request again
                  </button>}
              </form>
            </>}
          {!registration && <p className="auth-toggle">
              {register ? "Already have an account?" : "Don't have an account?"}{" "}
              <button onClick={() => {
    setRegister(!register);
    setMode("PASSWORD");
    setOtpSent(false);
    setError("");
  }}>
                {register ? "Sign In" : "Sign Up"}
              </button>
            </p>}
        </div>
      </div>
    </div>;
}
function Account() {
  const s = useStore(), nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const allowedTabs = /* @__PURE__ */ new Set(["orders", "saved", "profile", "notifications", "support"]);
  const requestedTab = params.get("tab") || "orders";
  const tab = allowedTabs.has(requestedTab) ? requestedTab : "orders";
  const [orderQuery, setOrderQuery] = useState("");
  const [orderStatus, setOrderStatus] = useState("ALL");
  const [orderPeriod, setOrderPeriod] = useState("ALL");
  const [supportBusy, setSupportBusy] = useState(false);
  const [supportForm, setSupportForm] = useState({
    type: "ORDER",
    subject: "",
    message: ""
  });
  const orders = useData("/orders"), products = useData("/products"), notifications = useData("/notifications"), tickets = useData("/support");
  function chooseTab(next) {
    const n = new URLSearchParams(params);
    n.set("tab", next);
    setParams(n, { replace: true });
  }
  const filteredOrders = (orders.data || []).filter((o) => {
    const queryOk = !orderQuery || o.id.toLowerCase().includes(orderQuery.toLowerCase());
    const statusOk = orderStatus === "ALL" || (orderStatus === "PAID" ? ["PAID", "PAID_REVIEW"].includes(o.status) : o.status === orderStatus);
    const age = Date.now() - new Date(o.created_at).getTime();
    const periodOk = orderPeriod === "ALL" || orderPeriod === "30" && age <= 30 * 24 * 60 * 60 * 1e3 || orderPeriod === "180" && age <= 180 * 24 * 60 * 60 * 1e3;
    return queryOk && statusOk && periodOk;
  });
  return <Layout>
      <div className="container page">
        <div className="account-greeting glass-card">
          <div>
            <span className="eyebrow">YOUR ELECTROHUB</span>
            <h1>
              Welcome, <span className="gradient-text">{s.user?.name}.</span>
            </h1>
            <p>Profile, electronics orders, notifications and customer care — all in one place.</p>
          </div>
          <CheckCircle2 size={58} />
        </div>
        <div className="account-grid">
          <aside className="glass-card account-nav">
            {[
    ["orders", "My orders", Package],
    ["saved", "Saved products", Heart],
    ["profile", "My profile", User],
    ["notifications", "Notifications", Bell],
    ["support", "Customer care", Headphones]
  ].map(([id, label, Icon]) => {
    const I = Icon;
    return <button
      key={String(id)}
      className={tab === id ? "active" : ""}
      onClick={() => chooseTab(String(id))}
    >
                  <I size={18} />
                  {String(label)}
                </button>;
  })}
            <button
    onClick={async () => {
      try {
        await s.logout();
        nav("/");
      } catch (e) {
        toast.error(message(e));
      }
    }}
  >
              <LogOut size={18} /> Sign out
            </button>
          </aside>

          <div>
            {tab === "orders" ? <>
                <div className="row account-section-head">
                  <div>
                    <h2>My orders</h2>
                    <p className="muted">Find an order quickly using electronic-store order filters.</p>
                  </div>
                  <button className="button outline small" onClick={orders.reload}>Refresh</button>
                </div>
                <div className="order-filter-bar glass-card">
                  <label className="order-search">
                    <Search size={17} />
                    <input
    aria-label="Search order ID"
    placeholder="Search order ID"
    value={orderQuery}
    onChange={(e) => setOrderQuery(e.target.value)}
  />
                  </label>
                  <select aria-label="Order status" value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
                    <option value="ALL">All orders</option>
                    <option value="PENDING">Awaiting payment</option>
                    <option value="PAID">Paid</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                  </select>
                  <select aria-label="Order period" value={orderPeriod} onChange={(e) => setOrderPeriod(e.target.value)}>
                    <option value="ALL">All time</option>
                    <option value="30">Last 30 days</option>
                    <option value="180">Last 6 months</option>
                  </select>
                </div>
                <div className="order-status-chips">
                  {["ALL", "PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"].map((status) => <button
    key={status}
    className={orderStatus === status ? "active" : ""}
    onClick={() => setOrderStatus(status)}
  >
                      {status === "ALL" ? "All" : status === "PENDING" ? "Awaiting payment" : status.toLowerCase()}
                    </button>)}
                </div>
                {orders.loading ? <Loading /> : orders.error ? <ErrorState error={orders.error} retry={orders.reload} /> : filteredOrders.length ? filteredOrders.map((o) => <Link className="glass-card order-row" key={o.id} to={"/account/orders/" + o.id}>
                      <span>
                        <b>Order #{o.id.slice(0, 8)}</b>
                        <small>{new Date(o.created_at).toLocaleDateString("en-IN")}</small>
                      </span>
                      <Status status={o.status} />
                      <strong>{money(o.amount_paise)}</strong>
                      <span>View →</span>
                    </Link>) : <Empty title={orders.data?.length ? "No orders match these filters" : "No orders yet"}>
                    {orders.data?.length ? <button className="button outline" onClick={() => {
    setOrderQuery("");
    setOrderStatus("ALL");
    setOrderPeriod("ALL");
  }}>
                        Clear order filters
                      </button> : void 0}
                  </Empty>}
              </> : tab === "saved" ? <>
                <h2>Saved products</h2>
                {products.loading ? <Loading /> : products.error ? <ErrorState error={products.error} retry={products.reload} /> : products.data?.some((p) => s.likes.includes(p.id)) ? <div className="product-grid compact">
                    {products.data.filter((p) => s.likes.includes(p.id)).map((p) => <ProductCard key={p.id} p={p} />)}
                  </div> : <Empty title="Save something you love" />}
              </> : tab === "profile" ? <div className="glass-card profile">
                <h2>My profile</h2>
                <label>Full name<input readOnly value={s.user?.name || ""} /></label>
                <label>Email<input readOnly value={s.user?.email || ""} /></label>
                <label>Mobile<input readOnly value={s.user?.phone || "Not added"} /></label>
                <small className="muted">Delivery addresses are collected securely with each order.</small>
              </div> : tab === "notifications" ? <div className="account-notifications">
                <div className="row account-section-head">
                  <div>
                    <h2>Notifications</h2>
                    <p className="muted">Order, delivery and account updates.</p>
                  </div>
                  <button
    className="button outline small"
    onClick={async () => {
      try {
        await api("/notifications/read-all", { method: "PATCH" });
        notifications.reload();
        toast.success("All notifications marked as read");
      } catch (e) {
        toast.error(message(e));
      }
    }}
  >Mark all read</button>
                </div>
                {notifications.loading ? <Loading /> : notifications.error ? <ErrorState error={notifications.error} retry={notifications.reload} /> : notifications.data?.length ? <div className="account-notification-list">
                    {notifications.data.map((n) => <Link
    key={n.id}
    to={n.link_url || "/account?tab=notifications"}
    className={"glass-card account-notification " + (!n.read_at ? "unread" : "")}
    onClick={async () => {
      if (!n.read_at) {
        try {
          await api("/notifications/" + n.id + "/read", { method: "PATCH" });
        } catch {
        }
      }
    }}
  >
                        <Bell size={18} />
                        <span><strong>{n.title}</strong><small>{n.message}</small></span>
                        <time>{new Date(n.created_at).toLocaleString("en-IN")}</time>
                      </Link>)}
                  </div> : <Empty title="No notifications yet" />}
              </div> : <div className="customer-care-grid">
                <div className="glass-card support-form-card">
                  <span className="eyebrow">CUSTOMER CARE</span>
                  <h2>How can we help?</h2>
                  <p>Raise a ticket for an electronics order, payment, return, product or account issue.</p>
                  <form
    onSubmit={async (e) => {
      e.preventDefault();
      setSupportBusy(true);
      try {
        await post("/support", supportForm);
        setSupportForm({ type: "ORDER", subject: "", message: "" });
        tickets.reload();
        toast.success("Customer care ticket submitted");
      } catch (e2) {
        toast.error(message(e2));
      } finally {
        setSupportBusy(false);
      }
    }}
  >
                    <label>Issue type
                      <select value={supportForm.type} onChange={(e) => setSupportForm({ ...supportForm, type: e.target.value })}>
                        <option value="ORDER">Order & delivery</option>
                        <option value="PAYMENT">Payment</option>
                        <option value="PRODUCT">Product support</option>
                        <option value="RETURN">Return / refund</option>
                        <option value="ACCOUNT">Account</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </label>
                    <label>Subject
                      <input required minLength={5} maxLength={120} value={supportForm.subject} onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })} placeholder="Example: Delivery status for order…" />
                    </label>
                    <label>Message
                      <textarea required minLength={10} maxLength={2e3} rows={6} value={supportForm.message} onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })} placeholder="Describe the issue and include your order ID when relevant." />
                    </label>
                    <button className="button" disabled={supportBusy}>
                      <Send size={17} /> {supportBusy ? "Submitting\u2026" : "Submit ticket"}
                    </button>
                  </form>
                </div>
                <div className="support-history">
                  <div className="row"><h2>My support tickets</h2><button className="button outline small" onClick={tickets.reload}>Refresh</button></div>
                  {tickets.loading ? <Loading /> : tickets.error ? <ErrorState error={tickets.error} retry={tickets.reload} /> : tickets.data?.length ? tickets.data.map((ticket) => <article className="glass-card support-ticket" key={ticket.id}>
                      <div className="row">
                        <span><b>{ticket.subject}</b><small>Ticket #{ticket.id.slice(0, 8)}</small></span>
                        <span className={"support-status status-" + ticket.status.toLowerCase()}>{ticket.status.toLowerCase()}</span>
                      </div>
                      <p>{ticket.message}</p>
                      <small className="muted">{ticket.type.replaceAll("_", " ")} · {new Date(ticket.created_at).toLocaleString("en-IN")}</small>
                    </article>) : <Empty title="No customer care tickets yet" />}
                </div>
              </div>}
          </div>
        </div>
      </div>
    </Layout>;
}
function Status({ status }) {
  return <span className={"status status-" + status.toLowerCase()}>
      {status === "PAID_REVIEW" ? "Paid \xB7 owner review" : status === "PENDING" ? "Awaiting payment" : status.toLowerCase().replaceAll("_", " ")}
    </span>;
}
function OrderDetails() {
  const { id } = useParams();
  const o = useData("/orders/" + id);
  useEffect(() => {
    if (o.data?.status !== "PENDING") return;
    const timer = setInterval(o.reload, 1e4);
    return () => clearInterval(timer);
  }, [o.data?.status, o.reload]);

  const statusRank = { PENDING: 0, PAID_REVIEW: 1, PAID: 1, PROCESSING: 2, SHIPPED: 3, DELIVERED: 4 };
  const stepRank = statusRank[o.data?.status] ?? 0;
  const created = o.data?.created_at ? new Date(o.data.created_at) : null;
  const dateLabel = created ? created.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";
  const sellingTotal = (o.data?.items || []).reduce((sum, item) => sum + Number(item.price_paise || 0) * Number(item.quantity || 0), 0);
  const steps = [
    ["Order confirmed", CheckCircle2, 1],
    ["Processing", Package, 2],
    ["Shipped", Truck, 3],
    ["Delivered", PackageCheck, 4]
  ];

  return <Layout>
      <div className="order-detail-page">
        <div className="container order-breadcrumbs">
          <Link to="/">Home</Link><span>›</span><Link to="/account?tab=orders">My Account</Link><span>›</span><Link to="/account?tab=orders">My Orders</Link><span>›</span><b>{o.data?.id?.slice(0, 18) || "Order"}</b>
        </div>

        {o.loading && !o.data ? <Loading /> : o.error ? <div className="container"><ErrorState error={o.error} retry={o.reload} /></div> : o.data && <div className="container marketplace-order-grid">
            <section className="order-main-column">
              <article className="market-order-card">
                <div className="order-products-block">
                  {o.data.items?.map((item) => <div className="order-product-summary" key={item.id}>
                      <div className="order-product-copy">
                        <h2>{item.name}</h2>
                        <small>Electronics · Quantity {item.quantity}</small>
                        <p>Sold by ElectroHub</p>
                        <strong>{money(Number(item.price_paise) * Number(item.quantity))}</strong>
                      </div>
                      <div className="order-product-thumb"><Photo src={item.image_url} alt={item.name} /></div>
                    </div>)}
                </div>

                {o.data.status === "PENDING" ? <div className="payment-pending-banner">
                    <Clock3 size={20} />
                    <div><b>Payment confirmation pending</b><span>If you completed payment, this page will refresh automatically after confirmation.</span></div>
                  </div> : null}
                {o.data.status === "PAID_REVIEW" ? <div className="payment-pending-banner warning">
                    <Clock3 size={20} />
                    <div><b>Payment received · order under review</b><span>Our team is checking product availability. Use Customer Care if you need help.</span></div>
                  </div> : null}

                <div className="order-timeline">
                  {steps.map(([label, Icon, rank], index) => {
                    const done = stepRank >= rank;
                    const active = stepRank + 1 === rank || (stepRank === 0 && rank === 1);
                    return <div className={`timeline-step ${done ? "done" : active ? "active" : ""}`} key={label}>
                        <div className="timeline-rail">
                          <span className="timeline-dot">{done ? "✓" : ""}</span>
                          {index < steps.length - 1 && <span className="timeline-line" />}
                        </div>
                        <div>
                          <b>{label}</b>
                          <small>{done ? dateLabel : active ? "In progress" : "Pending"}</small>
                        </div>
                      </div>;
                  })}
                </div>

                <div className="order-update-note">
                  {o.data.status === "DELIVERED" ? "Your order has been delivered successfully." : o.data.status === "SHIPPED" ? "Your order is on the way." : o.data.status === "PROCESSING" ? "Your order is being prepared for dispatch." : o.data.status === "PAID" ? "Your order is confirmed and will be processed shortly." : "You can track every update from this page."}
                </div>
                <Link className="order-chat-button" to="/account?tab=support"><MessageCircle size={18} /> Chat with us</Link>
              </article>

              <div className="order-id-bar">
                <span>Order #{o.data.id}</span>
                <button aria-label="Copy order id" onClick={async () => {
                  try { await window.navigator.clipboard.writeText(o.data.id); toast.success("Order ID copied"); } catch { toast.error("Could not copy order ID"); }
                }}><Copy size={15} /></button>
              </div>
            </section>

            <aside className="order-side-column">
              <section className="order-side-card">
                <div className="order-side-title"><h3>Delivery details</h3></div>
                <div className="delivery-info-box">
                  <MapPin size={18} />
                  <div><b>Home</b><span>{o.data.address}, {o.data.pincode}</span></div>
                </div>
                <div className="delivery-info-box compact">
                  <Home size={18} />
                  <div><b>{o.data.recipient}</b><span>{o.data.phone}</span></div>
                </div>
              </section>

              <section className="order-side-card price-card">
                <div className="order-side-title"><h3>Price details</h3></div>
                <div className="price-detail-row"><span>Selling price</span><b>{money(sellingTotal || o.data.amount_paise)}</b></div>
                <div className="price-detail-row"><span>Delivery charges</span><b className="free-charge">FREE</b></div>
                <div className="price-detail-row total"><span>Total amount</span><b>{money(o.data.amount_paise)}</b></div>
                <div className="paid-by-box"><span>Paid By</span><b><CreditCard size={16} /> {o.data.payment_id ? "Online Payment" : "Awaiting payment"}</b></div>
                {o.data.payment_id && <small className="payment-reference">Payment reference: {o.data.payment_id}</small>}
                <button className="invoice-button" onClick={() => window.print()}><Download size={18} /> Download Invoice</button>
              </section>

              <section className="order-side-card offers-earned">
                <span>🏆 Offers earned</span><span>›</span>
              </section>
            </aside>
          </div>}
      </div>
    </Layout>;
}
function Unsubscribe() {
  const [email, setEmail] = useState(""), [busy, setBusy] = useState(false);
  return <Layout>
      <div className="container page narrow">
        <h1>Unsubscribe</h1>
        <form
    className="glass-card profile"
    onSubmit={async (e) => {
      e.preventDefault();
      setBusy(true);
      try {
        await post("/newsletter/unsubscribe", { email });
        toast.success("You have been unsubscribed");
      } catch (e2) {
        toast.error(message(e2));
      } finally {
        setBusy(false);
      }
    }}
  >
          <label>
            Email
            <input
    required
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
          </label>
          <button disabled={busy} className="button">
            Unsubscribe
          </button>
        </form>
      </div>
    </Layout>;
}
export {
  Account,
  Auth,
  OrderDetails,
  Status,
  Unsubscribe
};
