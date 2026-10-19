import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  ShoppingCart,
  Heart,
  ShieldCheck,
  Truck,
  Star,
  Search,
  SlidersHorizontal,
  MapPin,
  BadgeCheck,
  CreditCard,
  Wrench,
  Box,
  ChevronRight,
  Percent,
  Smartphone,
  Laptop,
  Tv,
  Speaker,
  Gamepad2,
  Camera,
  Watch,
  Cpu,
  Router,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import {
  Layout,
  Photo,
  ProductCard,
  Newsletter,
  Loading,
  ErrorState,
  Empty
} from "../../components/common/SharedComponents";
import { useData } from "../../hooks/useData";
import { useStore } from "../../context/StoreContext";
import { money, message } from "../../utils/format";
import { post } from "../../services/api";

import { RatingPicker, RatingSummary } from "../../components/reviews/Ratings";

const quickCategories = [
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

function Home() {
  const products = useData("/products"), cats = useData("/categories");
  const all = products.data || [];
  const featured = all.filter((p) => p.featured).slice(0, 8);
  const deals = all.filter((p) => p.deal).slice(0, 8);
  const mobiles = all.filter((p) => /phone|mobile|smartphone/i.test(`${p.name} ${p.category_name}`)).slice(0, 8);
  const laptops = all.filter((p) => /laptop|notebook|macbook/i.test(`${p.name} ${p.category_name}`)).slice(0, 8);
  const audio = all.filter((p) => /audio|headphone|earbud|speaker/i.test(`${p.name} ${p.category_name}`)).slice(0, 8);
  const hero = deals[0] || featured[0] || all[0];
  const promo = [deals[1], laptops[0], audio[0]].filter(Boolean);

  const ProductShelf = ({ title, subtitle, items, link = "/shop" }) => <section className="fk-shelf">
      <div className="fk-shelf-head">
        <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
        <Link className="fk-round-arrow" to={link} aria-label={`View ${title}`}><ArrowRight size={19}/></Link>
      </div>
      <div className="fk-product-scroller">
        {items.map((p) => <ProductCard key={p.id} p={p} compact />)}
      </div>
    </section>;

  return <Layout>
      <div className="fk-home-page">
        <section className="container fk-quick-category-row">
          {quickCategories.map(([name, query, Icon]) => <Link key={name} to={`/shop?q=${query}`} className="fk-quick-category">
              <span><Icon size={25}/></span><b>{name}</b>
            </Link>)}
        </section>

        <section className="container fk-festival-hero">
          <div className="fk-festival-copy">
            <span className="fk-sale-kicker">ELECTROHUB TECH FEST</span>
            <h1>Big upgrades.<br/>Smarter prices.</h1>
            <p>Electronics-only deals across mobiles, laptops, audio, gaming, TVs, cameras and smart devices.</p>
            <div className="fk-hero-actions">
              <Link to="/shop?offer=deal" className="fk-yellow-button">Shop top deals <ArrowRight size={18}/></Link>
              <Link to="/shop" className="fk-ghost-button">Explore all electronics</Link>
            </div>
            <div className="fk-hero-trust"><span><ShieldCheck size={16}/> Secure payments</span><span><Truck size={16}/> Free delivery</span><span><BadgeCheck size={16}/> Verified catalogue</span></div>
          </div>
          <div className="fk-festival-product">
            <div className="fk-orbit orbit-one"/><div className="fk-orbit orbit-two"/>
            {hero ? <Link to={`/product/${hero.id}`} className="fk-hero-product-card">
                <Photo src={hero.image_url} alt={hero.name}/>
                <div><small>{hero.category_name}</small><b>{hero.name}</b><strong>{money(hero.price_paise)}</strong></div>
              </Link> : <div className="fk-hero-placeholder"><Zap size={48}/><b>Electronics offers</b></div>}
          </div>
        </section>

        <section className="container fk-promo-row">
          {promo.length ? promo.map((p, i) => <Link to={`/product/${p.id}`} className={`fk-promo-tile promo-${i + 1}`} key={p.id}>
              <div><small>{i === 0 ? "LIMITED DEAL" : i === 1 ? "LAPTOP PICKS" : "AUDIO DAYS"}</small><h3>{p.name}</h3><span>From {money(p.price_paise)}</span></div>
              <Photo src={p.image_url} alt={p.name}/>
            </Link>) : quickCategories.slice(0,3).map(([name,query,Icon],i)=><Link to={`/shop?q=${query}`} className={`fk-promo-tile promo-${i+1}`} key={name}><div><small>TOP CATEGORY</small><h3>{name}</h3><span>Explore now</span></div><Icon size={78}/></Link>)}
        </section>

        <section className="container fk-category-market" id="categories">
          <div className="fk-shelf-head"><div><h2>Shop by category</h2><p>Everything is electronics. Nothing else.</p></div></div>
          {cats.loading ? <Loading/> : cats.error ? <ErrorState error={cats.error} retry={cats.reload}/> : <div className="fk-category-grid">
            {(cats.data || []).slice(0,12).map((c)=><Link to={`/shop?category=${c.id}`} key={c.id} className="fk-category-card"><Photo src={c.image_url} alt={c.name}/><b>{c.name}</b><small>{c.product_count || 0} products</small></Link>)}
          </div>}
        </section>

        <div className="container fk-home-shelves" id="deals">
          {products.loading ? <Loading/> : products.error ? <ErrorState error={products.error} retry={products.reload}/> : <>
            <ProductShelf title="Best deals on electronics" subtitle="Limited-time prices on popular tech" items={deals.length ? deals : all.slice(0,8)} link="/shop?offer=deal"/>
            {laptops.length > 0 && <ProductShelf title="Top laptops" subtitle="Work, college, creator and gaming picks" items={laptops} link="/shop?q=laptop"/>}
            {mobiles.length > 0 && <ProductShelf title="Best of mobiles" subtitle="Popular smartphones across budgets" items={mobiles} link="/shop?q=mobile"/>}
            {audio.length > 0 && <ProductShelf title="Audio favourites" subtitle="Headphones, earbuds and speakers" items={audio} link="/shop?q=audio"/>}
            <ProductShelf title="Recommended for you" subtitle="More electronics from the catalogue" items={featured.length ? featured : all.slice(0,8)}/>
          </>}
        </div>
        <Newsletter/>
      </div>
    </Layout>;
}

function Shop() {
  const { data, error, loading, reload } = useData("/products"), cats = useData("/categories");
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const category = params.get("category") || "";
  const sort = params.get("sort") || "popular";
  const price = params.get("price") || "";
  const rating = Number(params.get("rating") || "0");
  const availability = params.get("availability") || "";
  const offer = params.get("offer") || "";
  const feature = params.get("feature") || "";
  const brand = params.get("brand") || "";

  function filter(k, v) {
    const n = new URLSearchParams(params);
    if (v) n.set(k, v); else n.delete(k);
    setParams(n);
  }
  function matchesPrice(p) {
    if (!price) return true;
    if (price === "under5") return p.price_paise < 5e5;
    if (price === "5to20") return p.price_paise >= 5e5 && p.price_paise < 2e6;
    if (price === "20to50") return p.price_paise >= 2e6 && p.price_paise < 5e6;
    return p.price_paise >= 5e6;
  }
  function matchesFeature(p) {
    if (!feature) return true;
    const text = `${p.name} ${p.description} ${p.category_name}`.toLowerCase();
    const terms = {
      wireless: ["wireless", "bluetooth", "audio"], gaming: ["gaming", "game", "graphics", "controller"],
      smart: ["smart", "smartphone", "wearable", "watch"], display4k: ["4k", "television", "tv"],
      camera: ["camera", "mirrorless"], components: ["component", "graphics card", "gpu"]
    };
    return (terms[feature] || [feature]).some((term) => text.includes(term));
  }
  const brands = useMemo(() => Array.from(new Set((data || []).map((p) => String(p.name || "").trim().split(/\s+/)[0]).filter((x)=>x.length>1))).slice(0,12), [data]);
  const normalized = q.trim().toLowerCase();
  const products = (data || []).filter((p) => {
    const searchable = `${p.name} ${p.description} ${p.category_name} ${p.brand || ""} ${p.model_number || ""} ${p.sku || ""} ${p.color || ""} ${p.variant_label || ""}`.toLowerCase();
    const brandName = String(p.brand || p.name || "").trim().split(/\s+/)[0];
    return (!category || p.category_id === category) && (!normalized || searchable.includes(normalized)) && (!brand || brandName === brand) && matchesPrice(p) && (!availability || p.stock > 0) && (!offer || p.deal) && (!rating || (p.average_rating || 0) >= rating) && matchesFeature(p);
  }).sort((a,b)=> sort === "low" ? a.price_paise-b.price_paise : sort === "high" ? b.price_paise-a.price_paise : sort === "new" ? String(b.id).localeCompare(String(a.id)) : sort === "rating" ? (b.average_rating||0)-(a.average_rating||0) : Number(b.deal)-Number(a.deal));

  const title = q ? `Results for “${q}”` : category ? cats.data?.find((c)=>c.id===category)?.name || "Electronics" : "All Electronics";
  return <Layout>
      <div className="fk-listing-page">
        <div className="container fk-breadcrumbs"><Link to="/">Home</Link><ChevronRight size={12}/><span>Electronics</span>{q && <><ChevronRight size={12}/><span>{q}</span></>}</div>
        <div className="container fk-listing-layout">
          <aside className="fk-filter-sidebar">
            <div className="fk-filter-title"><h3>Filters</h3><SlidersHorizontal size={18}/></div>
            <div className="fk-filter-section"><b>CATEGORIES</b><button className={!category?"active":""} onClick={()=>filter("category","")}>All Electronics</button>{cats.data?.map((c)=><button key={c.id} className={category===c.id?"active":""} onClick={()=>filter("category",c.id)}>{c.name}</button>)}</div>
            <div className="fk-filter-section"><b>BRAND</b>{brands.map((b)=><label key={b}><input type="checkbox" checked={brand===b} onChange={()=>filter("brand",brand===b?"":b)}/><span>{b}</span></label>)}</div>
            <div className="fk-filter-section"><b>PRICE</b><select value={price} onChange={(e)=>filter("price",e.target.value)}><option value="">Any price</option><option value="under5">Under ₹5,000</option><option value="5to20">₹5,000 – ₹20,000</option><option value="20to50">₹20,000 – ₹50,000</option><option value="over50">₹50,000+</option></select></div>
            <div className="fk-filter-section"><b>CUSTOMER RATINGS</b><label><input type="radio" name="rating" checked={rating===4} onChange={()=>filter("rating","4")}/><span>4★ & above</span></label><label><input type="radio" name="rating" checked={rating===3} onChange={()=>filter("rating","3")}/><span>3★ & above</span></label><button className="fk-clear-link" onClick={()=>filter("rating","")}>Clear rating</button></div>
            <div className="fk-filter-section"><b>FEATURES</b><select value={feature} onChange={(e)=>filter("feature",e.target.value)}><option value="">All features</option><option value="wireless">Wireless / Bluetooth</option><option value="gaming">Gaming</option><option value="smart">Smart devices</option><option value="display4k">4K / TV</option><option value="camera">Camera</option><option value="components">PC components</option></select></div>
            <div className="fk-filter-section"><label><input type="checkbox" checked={Boolean(offer)} onChange={()=>filter("offer",offer?"":"deal")}/><span>Deals only</span></label><label><input type="checkbox" checked={Boolean(availability)} onChange={()=>filter("availability",availability?"":"stock")}/><span>In stock</span></label></div>
          </aside>

          <section className="fk-listing-results">
            <div className="fk-listing-heading"><div><small>Electronics</small><h1>{title}</h1><span>Showing {products.length} product{products.length===1?"":"s"}</span></div></div>
            <div className="fk-sort-row"><b>Sort By</b>{[["popular","Popularity"],["low","Price -- Low to High"],["high","Price -- High to Low"],["new","Newest First"],["rating","Customer Rating"]].map(([v,l])=><button key={v} className={sort===v?"active":""} onClick={()=>filter("sort",v)}>{l}</button>)}</div>
            {q && <div className="fk-inline-search"><Search size={17}/><input value={q} onChange={(e)=>filter("q",e.target.value)} aria-label="Search within results"/><button onClick={()=>filter("q","")}>Clear</button></div>}
            {loading ? <Loading/> : error ? <ErrorState error={error} retry={reload}/> : products.length ? <div className="fk-product-grid">{products.map((p)=><ProductCard key={p.id} p={p}/>)}</div> : <Empty title="No electronics match these filters"/>}
          </section>
        </div>
      </div>
    </Layout>;
}

function ProductDetails() {
  const { id } = useParams();
  const { data: p, error, loading, reload } = useData("/products/" + id);
  const [review, setReview] = useState({ rating: 5, title: "", body: "" });
  const [reviewBusy, setReviewBusy] = useState(false);
  const [ratingFilter, setRatingFilter] = useState(0);
  useEffect(() => { setRatingFilter(0); setReview({ rating: 5, title: "", body: "" }); }, [id]);
  const [pincode, setPincode] = useState("");
  const s = useStore();
  const nav = useNavigate();
  const reviews = useData("/products/" + id + "/reviews");

  const filteredReviews = (reviews.data || []).filter(r => !ratingFilter || Number(r.rating) === ratingFilter);
  if (loading) return <Layout><Loading/></Layout>;
  if (error || !p) return <Layout><ErrorState error={error} retry={reload}/></Layout>;
  let images = [], videos = [], highlights = [], specs = {};
  try { images = JSON.parse(p.images || "[]"); } catch { /* gallery optional */ }
  try { videos = JSON.parse(p.video_urls || "[]"); } catch { /* video optional */ }
  try { highlights = JSON.parse(p.highlights || "[]"); } catch { /* highlights optional */ }
  try { specs = JSON.parse(p.specifications || "{}"); } catch { /* specs optional */ }
  images = Array.from(new Set([p.image_url, ...images].filter(Boolean)));
  const mosaic = images.length ? [...images] : [p.image_url];
  while (mosaic.length < 4) mosaic.push(mosaic[0]);
  const discount = p.original_price_paise > p.price_paise ? Math.round((1-p.price_paise/p.original_price_paise)*100) : 0;
  const add = () => {
    const n = s.cart.find((c)=>c.productId===p.id)?.quantity || 0;
    if (n >= Math.min(p.max_order_quantity || 10,p.stock)) return toast.error("Maximum quantity reached");
    s.setQuantity(p.id,n+1); toast.success("Added to cart");
  };
  const buy = () => {
    const target = "/buy-now/" + p.id;
    nav(s.user ? target : "/auth?next=" + encodeURIComponent(target));
  };

  return <Layout>
      <div className="fk-product-page">
        <div className="container fk-breadcrumbs"><Link to="/">Home</Link><ChevronRight size={12}/><Link to="/shop">Electronics</Link><ChevronRight size={12}/><span>{p.category_name}</span><ChevronRight size={12}/><b>{p.name}</b></div>
        <div className="container fk-product-detail-layout">
          <section className="fk-product-gallery">
            {mosaic.slice(0,4).map((url,i)=><button className="fk-gallery-tile" key={`${url}-${i}`} type="button"><Photo src={url} alt={`${p.name} view ${i+1}`}/>{i===0 && <span className="fk-new-badge">TOP PICK</span>}</button>)}
          </section>

          <section className="fk-product-info-panel">
            <div className="fk-product-wishlist"><button onClick={()=>s.toggleLike(p.id)} aria-label="Wishlist"><Heart size={20} fill={s.likes.includes(p.id)?"currentColor":"none"}/></button></div>
            <div className="fk-product-option-block"><b>Category:</b><span className="fk-option-chip selected">{p.category_name}</span></div>
            {(p.color || p.variant_label) && <div className="fk-product-option-block"><b>Configuration:</b>{p.color && <span className="fk-option-chip selected">{p.color}</span>}{p.variant_label && <span className="fk-option-chip selected">{p.variant_label}</span>}<Link to={`/shop?q=${encodeURIComponent(p.category_name)}`} className="fk-option-chip muted-chip">See similar</Link></div>}
            <Link className="fk-brand-store-link" to={`/shop?q=${encodeURIComponent(p.brand || String(p.name).split(/\s+/)[0])}`}>Visit {p.brand || "brand"} results</Link>
            <h1>{p.name}</h1>
            {(p.model_number || p.sku) && <div className="fk-model-meta">{p.model_number && <span><b>Model:</b> {p.model_number}</span>}{p.sku && <span><b>SKU:</b> {p.sku}</span>}</div>}
            <div className="fk-rating-line">{Number(p.average_rating||0)>0 && <span className="market-rating">{Number(p.average_rating).toFixed(1)} ★</span>}<span>{p.review_count || 0} ratings & reviews</span><span className="verified-chip">Verified</span></div>
            <div className="fk-main-price"><span className="fk-discount-large">{discount>0?`↓${discount}%`:"Special price"}</span>{p.original_price_paise>p.price_paise && <del>{money(p.original_price_paise)}</del>}<strong>{money(p.price_paise)}</strong></div>
            <div className="fk-deal-strip"><b>WOW! DEAL</b><span>Buy now at {money(p.price_paise)}</span></div>
            <div className="fk-offer-box"><h3>Available offers</h3><p><Percent size={16}/> Extra savings may apply through your payment provider at checkout.</p><p><CreditCard size={16}/> UPI, cards and netbanking supported through Razorpay.</p></div>

            <div className="fk-delivery-card">
              <h2>Delivery & installation details</h2>
              <div className="fk-pincode-row"><MapPin size={18}/><input inputMode="numeric" maxLength={6} placeholder="Enter delivery pincode" value={pincode} onChange={(e)=>setPincode(e.target.value.replace(/\D/g,"").slice(0,6))}/><button type="button" onClick={()=>toast.info(pincode.length===6?"Delivery availability is confirmed during checkout.":"Enter a valid 6-digit pincode")}>Check</button></div>
              <div className="fk-delivery-line"><Truck size={18}/><span><b>Free delivery</b><small>Delivery date is confirmed after checkout.</small></span></div>
              <div className="fk-delivery-line"><Box size={18}/><span><b>Sold by ElectroHub</b><small>Electronics-only catalogue</small></span></div>
            </div>

            <div className="fk-peace-card"><h2>Shop with peace of mind</h2><div className="fk-benefit-row"><span><Wrench size={21}/><b>{p.warranty_months || 0} month warranty</b><small>{p.installation_required ? "Installation assistance available" : "Customer support from your account"}</small></span><span><CreditCard size={21}/><b>{p.cod_available ? "COD + secure payment" : "Secure online payment"}</b><small>Razorpay checkout</small></span><span><ShieldCheck size={21}/><b>{p.return_days || 0}-day replacement</b><small>Subject to store policy</small></span></div></div>

            <div className="fk-highlights"><h2>Product highlights</h2>{highlights.length ? <ul className="fk-highlight-list">{highlights.map((item,i)=><li key={`${item}-${i}`}>{item}</li>)}</ul> : <p>{p.description}</p>}<div className="fk-highlight-chips"><span>{p.stock>0?`${p.stock} in stock`:"Out of stock"}</span><span>{p.category_name}</span>{p.country_of_origin && <span>Origin: {p.country_of_origin}</span>}</div></div>

            {Object.keys(specs).length > 0 && <div className="fk-specifications"><h2>Specifications</h2><div className="fk-spec-table">{Object.entries(specs).map(([key,value])=><div key={key}><span>{key}</span><b>{value}</b></div>)}</div></div>}

            {videos.length > 0 && <div className="fk-product-videos"><h2>Product videos</h2><div className="fk-video-grid">{videos.map((url,i)=><video key={`${url}-${i}`} src={url} controls preload="metadata" playsInline />)}</div></div>}

            <div className="fk-product-description"><h2>Description</h2><p>{p.description}</p>{(p.hsn_code || p.shipping_weight_grams) && <div className="fk-commercial-meta">{p.hsn_code && <span>HSN: {p.hsn_code}</span>}{p.shipping_weight_grams>0 && <span>Package weight: {p.shipping_weight_grams} g</span>}</div>}</div>
          </section>
        </div>

        <div className="container fk-product-sticky-actions">
          <button className="fk-cart-square" onClick={add} disabled={!p.stock || s.user?.role==="ADMIN"}><ShoppingCart size={20}/></button>
          <button className="fk-buy-secondary" onClick={add} disabled={!p.stock || s.user?.role==="ADMIN"}><ShoppingCart size={18}/> Add to cart</button>
          <button className="fk-buy-primary" onClick={buy} disabled={!p.stock || s.user?.role==="ADMIN"}>Buy now <strong>{money(p.price_paise)}</strong></button>
        </div>

        <section className="container reviews-section fk-reviews-section">
          <div className="fk-shelf-head"><div><h2>Ratings & reviews</h2><p>{Number(p.average_rating||0).toFixed(1)} / 5 · {p.review_count || 0} review{p.review_count===1?"":"s"}</p></div></div>
          {!reviews.loading && !reviews.error && <RatingSummary reviews={reviews.data || []} selected={ratingFilter} onSelect={setRatingFilter}/>}
          {s.user?.role === "CUSTOMER" && <form className="glass-card review-form" onSubmit={async (e)=>{e.preventDefault();setReviewBusy(true);try{await post("/products/"+p.id+"/reviews",review);toast.success("Your review was saved");setReview({rating:5,title:"",body:""});reviews.reload();reload();}catch(e2){toast.error(message(e2));}finally{setReviewBusy(false);}}}>
              <div className="row"><div><h3>Review this product</h3><small className="muted">Available after a delivered purchase.</small></div><RatingPicker value={review.rating} onChange={(rating)=>setReview({...review,rating})}/></div>
              <input maxLength={120} value={review.title} onChange={(e)=>setReview({...review,title:e.target.value})} placeholder="Review title (optional)"/>
              <textarea maxLength={2000} rows={4} value={review.body} onChange={(e)=>setReview({...review,body:e.target.value})} placeholder="Share your experience"/>
              <button className="button" disabled={reviewBusy}>{reviewBusy?"Saving…":"Submit review"}</button>
            </form>}
          {reviews.loading ? <Loading/> : reviews.error ? <ErrorState error={reviews.error} retry={reviews.reload}/> : filteredReviews.length ? <div className="review-list">{filteredReviews.map((r)=><article className="glass-card review-card" key={r.id}><div className="row"><div><strong>{r.reviewer_name}</strong><small className="verified-review">Verified purchase</small></div><div className="stars" aria-label={`${r.rating} out of 5 stars`}>{Array.from({length:5}).map((_,i)=><Star key={i} size={16} fill={i<r.rating?"currentColor":"none"}/>)}</div></div>{r.title&&<h3>{r.title}</h3>}{r.body&&<p>{r.body}</p>}<small className="muted">{new Date(r.created_at).toLocaleDateString("en-IN")}</small></article>)}</div> : <div className="glass-card empty-reviews"><p>{ratingFilter ? `No ${ratingFilter} star reviews yet. Select another rating or clear the filter.` : "No reviews yet. Delivered customers can be the first to review this product."}</p></div>}
        </section>
      </div>
    </Layout>;
}

function About() {
  return <Layout>
      <div className="container page narrow">
        <span className="eyebrow">ELECTROHUB · PUNE</span>
        <h1>Technology for <span className="gradient-text">every day.</span></h1>
        <p className="lead">A focused electronics marketplace for smartphones, laptops, audio, gaming, TVs, wearables, cameras and components.</p>
        <div className="glass-card prose" id="shipping"><h2>Shipping information</h2><p>Enter your complete Indian delivery address and six-digit PIN code at checkout. Order progress appears in your account after the owner updates it.</p></div>
        <div className="glass-card prose" id="returns"><h2>Returns & payment support</h2><p>Keep your order number and payment ID for payment or delivery queries. Contact customer care before returning a product.</p></div>
        <div className="glass-card prose" id="privacy"><h2>Privacy</h2><p>Your account details, delivery address and order history are stored to operate the shop. Passwords are hashed. Card details are handled by Razorpay, not stored by this website.</p></div>
        <div className="glass-card prose" id="terms"><h2>Store information</h2><p>Availability and prices are confirmed by the server at checkout. Product photographs and catalogue information are managed by the store owner.</p></div>
      </div>
    </Layout>;
}

export { About, Home, ProductDetails, Shop };
