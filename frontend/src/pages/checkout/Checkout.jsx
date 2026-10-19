import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  LockKeyhole,
  Minus,
  Plus,
  Trash2,
  Heart,
  MapPin,
  ShieldCheck,
  ShoppingCart,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { Layout, Photo, Loading, Empty, ErrorState } from "../../components/common/SharedComponents";
import { useStore } from "../../context/StoreContext";
import { useData } from "../../hooks/useData";
import { post } from "../../services/api";
import { money, message } from "../../utils/format";

let sdkPromise = null;
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    const timer = window.setTimeout(() => {
      s.remove();
      reject(new Error("Payment window timed out. Check your connection and retry."));
    }, 2e4);
    s.onload = () => {
      clearTimeout(timer);
      if (window.Razorpay) resolve(); else reject(new Error("Payment window is unavailable"));
    };
    s.onerror = () => {
      clearTimeout(timer);
      s.remove();
      reject(new Error("Could not load Razorpay. Check your internet connection."));
    };
    document.body.append(s);
  }).catch((e) => { sdkPromise = null; throw e; });
  return sdkPromise;
}

function Cart({ buyNowProductId = null }) {
  const s = useStore(), catalog = useData("/products"), nav = useNavigate();
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const active = useRef(false);
  const requestKey = useRef({ fingerprint: "", key: "" });
  const [form, setForm] = useState({ recipient: s.user?.name || "", phone: "", address: "", pincode: "" });
  const checkoutItems = buyNowProductId ? [{ productId: buyNowProductId, quantity: buyQuantity }] : s.cart;
  const lines = checkoutItems.map((c) => ({ line: c, p: catalog.data?.find((p) => p.id === c.productId) }));
  const total = lines.reduce((n,c)=>n+(c.p?.price_paise||0)*c.line.quantity,0);
  const mrpTotal = lines.reduce((n,c)=>n+((c.p?.original_price_paise || c.p?.price_paise || 0))*c.line.quantity,0);
  const discount = Math.max(0,mrpTotal-total);
  const invalid = lines.some((c)=>!c.p || c.line.quantity>(c.p?.stock||0));

  async function pay(e) {
    e.preventDefault();
    if (!s.user) {
      const next = buyNowProductId ? "/buy-now/" + buyNowProductId : "/cart";
      nav("/auth?next=" + encodeURIComponent(next));
      return;
    }
    if (active.current) return;
    active.current = true; setBusy(true);
    let checkoutOpened = false;
    try {
      await loadCheckout();
      const payload = { items: checkoutItems, ...form };
      const fp = JSON.stringify(payload);
      if (requestKey.current.fingerprint !== fp) requestKey.current = { fingerprint: fp, key: crypto.randomUUID() };
      const order = await post("/orders", { ...payload, checkoutKey: requestKey.current.key });
      if (order.status !== "PENDING") { nav("/account/orders/" + order.id); return; }
      const R = window.Razorpay;
      if (!R) throw new Error("Razorpay unavailable");
      const checkout = new R({
        key: order.key, amount: order.amount, currency: order.currency, name: "ElectroHub", order_id: order.orderId,
        prefill: { name: form.recipient, email: s.user.email, contact: form.phone }, theme: { color: "#2874f0" },
        modal: { ondismiss: () => { setBusy(false); active.current = false; toast.info("Checkout closed. Your unpaid order is visible in your account."); } },
        handler: async (result) => {
          try {
            const paid = await post("/payments/verify", { localOrderId: order.id, ...result });
            if (["PAID","PROCESSING","SHIPPED","DELIVERED","PAID_REVIEW"].includes(paid.status)) {
              if (!buyNowProductId) s.clearCart();
              toast.success(paid.status === "PAID_REVIEW" ? "Payment received. The owner will review stock." : "Payment confirmed. Thank you!");
            } else toast.info("Payment is awaiting capture. We will update the order after confirmation.");
            nav("/account/orders/" + order.id);
          } catch (err) {
            toast.error(message(err) + " Check your order before paying again.");
            nav("/account/orders/" + order.id);
          } finally { setBusy(false); active.current = false; }
        }
      });
      checkout.on("payment.failed", () => toast.error("Payment failed. Retry in the payment window or close it."));
      checkout.open(); checkoutOpened = true;
    } catch (err) { toast.error(message(err)); }
    finally { if (!checkoutOpened) { setBusy(false); active.current = false; } }
  }

  return <Layout>
      <div className="fk-cart-page">
        <div className="container fk-cart-topline">
          <div><ShoppingCart size={22}/><h1>{buyNowProductId ? "Buy now" : "My Cart"}</h1><span>{checkoutItems.length} item{checkoutItems.length===1?"":"s"}</span></div>
          <Link to="/shop">Continue shopping</Link>
        </div>
        {catalog.loading ? <Loading/> : catalog.error ? <ErrorState error={catalog.error} retry={catalog.reload}/> : !checkoutItems.length ? <div className="container"><Empty title="Your cart is empty"/></div> : <form className="container fk-cart-layout" onSubmit={pay}>
            <section className="fk-cart-main">
              <div className="fk-address-card">
                <div><MapPin size={18}/><span><b>From saved address</b><small>{s.user ? "Enter delivery details for this order" : "Sign in to use saved delivery details"}</small></span></div>
                <button type="button" onClick={()=>document.getElementById("delivery-details")?.scrollIntoView({behavior:"smooth"})}>Enter Delivery Pincode</button>
              </div>
              {lines.map(({p,line})=><article className="fk-cart-item" key={line.productId}>
                  <div className="fk-cart-item-media">{p && <Link to={`/product/${p.id}`}><Photo src={p.image_url} alt={p.name}/></Link>}<div className="fk-cart-qty"><button type="button" disabled={busy||line.quantity<=1} onClick={()=>buyNowProductId?setBuyQuantity(Math.max(1,line.quantity-1)):s.setQuantity(line.productId,line.quantity-1)}><Minus size={13}/></button><span>{line.quantity}</span><button type="button" disabled={busy||line.quantity>=Math.min(p?.stock||0,p?.max_order_quantity||10)} onClick={()=>buyNowProductId?setBuyQuantity(Math.min(p?.max_order_quantity||10,p?.stock||1,line.quantity+1)):s.setQuantity(line.productId,line.quantity+1)}><Plus size={13}/></button></div></div>
                  <div className="fk-cart-item-copy">
                    <small className="fk-cart-sale-label">ElectroHub Price</small>
                    <h2>{p?.name || "Product no longer available"}</h2>
                    <span className="fk-cart-category">{p?.category_name || "Electronics"}</span>
                    {p && <div className="fk-cart-item-rating"><span className="market-rating">{Number(p.average_rating||0).toFixed(1) || "4.0"} ★</span><small>Verified electronics</small></div>}
                    {p && <div className="fk-cart-item-price">{p.original_price_paise>p.price_paise && <del>{money(p.original_price_paise)}</del>}<strong>{money(p.price_paise)}</strong>{p.original_price_paise>p.price_paise && <span>{Math.round((1-p.price_paise/p.original_price_paise)*100)}% off</span>}</div>}
                    {p && line.quantity>p.stock && <p className="error-text">Only {p.stock} left. Update quantity.</p>}
                    <div className="fk-cart-delivery"><TruckLabel/> Free delivery · Delivery date confirmed after checkout</div>
                  </div>
                  {!buyNowProductId && <div className="fk-cart-line-actions"><button type="button" onClick={()=>s.toggleLike(line.productId)}><Heart size={16}/> Save for later</button><button type="button" onClick={()=>s.setQuantity(line.productId,0)}><Trash2 size={16}/> Remove</button><button type="button" onClick={()=>nav(`/buy-now/${line.productId}`)}><Zap size={16}/> Buy this now</button></div>}
                  {buyNowProductId && <div className="fk-cart-line-actions"><Link to={`/product/${line.productId}`}>Change product</Link></div>}
                </article>)}
            </section>

            <aside className="fk-cart-summary" id="delivery-details">
              <div className="fk-price-box"><h3>Price Details</h3><div><span>MRP (incl. of all taxes)</span><b>{money(mrpTotal)}</b></div><div><span>Discounts</span><b className="green">− {money(discount)}</b></div><div><span>Delivery fee</span><b className="green">FREE</b></div><div className="fk-price-total"><span>Total Amount</span><b>{money(total)}</b></div>{discount>0&&<p>You’ll save {money(discount)} on this order!</p>}</div>
              <div className="fk-safe-pay"><ShieldCheck size={22}/><span><b>Safe and secure payments.</b><small>Authentic electronics and protected checkout.</small></span></div>
              {s.user?.role === "ADMIN" ? <p className="notice">Sign in with a customer account to place an order.</p> : s.user ? <div className="fk-delivery-form"><h3>Delivery details</h3><fieldset disabled={busy}>{["recipient","phone","address","pincode"].map((k)=><label key={k}><span>{{recipient:"Full name",phone:"Mobile number",address:"Complete delivery address",pincode:"PIN code"}[k]}</span><input required minLength={k==="address"?10:undefined} maxLength={k==="phone"?10:k==="pincode"?6:k==="address"?500:100} pattern={k==="phone"?"[6-9][0-9]{9}":k==="pincode"?"[1-9][0-9]{5}":undefined} inputMode={k==="phone"||k==="pincode"?"numeric":"text"} value={form[k]} onChange={(e)=>setForm({...form,[k]:e.target.value})}/></label>)}</fieldset><button className="fk-place-order" disabled={busy||invalid}><LockKeyhole size={18}/>{busy?"Processing…":`Place Order · ${money(total)}`}</button><small>Payment opens securely through Razorpay.</small></div> : <Link className="fk-place-order link" to={buyNowProductId?`/auth?next=${encodeURIComponent("/buy-now/"+buyNowProductId)}`:`/auth?next=${encodeURIComponent("/cart")}`}>Sign in to checkout</Link>}
            </aside>
          </form>}
      </div>
    </Layout>;
}

function TruckLabel(){return <span className="fk-mini-truck">🚚</span>;}
function BuyNow(){ const {id}=useParams(); return <Cart buyNowProductId={id}/>; }
export { Cart, BuyNow, loadCheckout };
