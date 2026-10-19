import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Layers,
  ShoppingBag,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  ArrowUpRight,
  Search,
  AlertTriangle,
  Eye,
  Copy,
  ListPlus,
  X,
  Save,
  ChevronDown,
  ChevronUp,
  Boxes,
  BadgeIndianRupee,
  ShieldCheck,
  Image as ImageIcon,
  Info,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../../context/StoreContext";
import { useData } from "../../hooks/useData";
import { api } from "../../services/api";
import {
  Logo,
  Photo,
  UploadField,
  MultiUploadField,
  VideoUploadField,
  Loading,
  ErrorState,
  ThemeToggle
} from "../../components/common/SharedComponents";
import { money, message } from "../../utils/format";
import { Status } from "../account/Account";

const blank = {
  name: "",
  description: "",
  category_id: "",
  brand: "",
  model_number: "",
  sku: "",
  color: "",
  variant_label: "",
  price: "",
  original: "",
  stock: 0,
  low_stock_threshold: 5,
  max_order_quantity: 10,
  warranty_months: 12,
  return_days: 7,
  hsn_code: "",
  gst_percent: "18.00",
  country_of_origin: "India",
  shipping_weight_grams: 0,
  image_url: "",
  images: [],
  video_urls: [],
  highlights: [""],
  specifications: [{ key: "", value: "" }],
  badge: "",
  cod_available: true,
  installation_required: false,
  featured: false,
  deal: false,
  active: true
};

function parseJson(value, fallback) {
  if (!value) return fallback;
  if (typeof value !== "string") return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function ProductSection({ icon: Icon, title, hint, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return <section className={`admin-form-section ${open ? "open" : ""}`}>
      <button type="button" className="admin-section-head" onClick={() => setOpen(!open)}>
        <span className="admin-section-icon"><Icon size={18} /></span>
        <span><b>{title}</b><small>{hint}</small></span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      <div className="admin-section-body"><div>{children}</div></div>
    </section>;
}

function Field({ label, hint, children }) {
  return <label className="admin-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function Admin() {
  const s = useStore(), nav = useNavigate();
  const [tab, setTab] = useState("products");
  const [editing, setEditing] = useState(null);
  const [cat, setCat] = useState(null);
  const [busy, setBusy] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [uploading, setUploading] = useState(0);
  const [productQuery, setProductQuery] = useState("");
  const [inventoryOnly, setInventoryOnly] = useState(false);

  const uploadBusy = (value) => setUploading((n) => Math.max(0, n + (value ? 1 : -1)));
  const products = useData("/admin/products");
  const categories = useData("/categories");
  const orders = useData("/admin/orders");
  const summary = useData("/admin/summary");

  const visibleProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    return (products.data || []).filter((p) => {
      const haystack = `${p.name} ${p.brand || ""} ${p.model_number || ""} ${p.sku || ""} ${p.category_name || ""}`.toLowerCase();
      return (!q || haystack.includes(q)) && (!inventoryOnly || Number(p.stock) <= Number(p.low_stock_threshold || 0));
    });
  }, [products.data, productQuery, inventoryOnly]);

  function reload() {
    products.reload();
    categories.reload();
    orders.reload();
    summary.reload();
  }

  async function saveProduct(e) {
    e.preventDefault();
    if (!editing || uploading > 0) return;
    if (!editing.image_url) return toast.error("Upload a main product image first");
    if (!editing.brand.trim() || !editing.model_number.trim() || !editing.sku.trim()) return toast.error("Brand, model number and SKU are required");
    setBusy(true);
    try {
      const specifications = Object.fromEntries(
        editing.specifications
          .map((row) => [row.key.trim(), row.value.trim()])
          .filter(([k, v]) => k && v)
      );
      const p = {
        ...editing,
        brand: editing.brand.trim(),
        model_number: editing.model_number.trim(),
        sku: editing.sku.trim().toUpperCase(),
        color: editing.color.trim(),
        variant_label: editing.variant_label.trim(),
        hsn_code: editing.hsn_code.trim(),
        country_of_origin: editing.country_of_origin.trim() || "India",
        price_paise: Math.round(Number(editing.price) * 100),
        original_price_paise: Math.round(Number(editing.original || 0) * 100),
        gst_percent: Number(editing.gst_percent || 0),
        highlights: editing.highlights.map((x) => x.trim()).filter(Boolean),
        specifications
      };
      delete p.price;
      delete p.original;
      await api("/admin/products" + (editing.id ? "/" + editing.id : ""), {
        method: editing.id ? "PUT" : "POST",
        body: JSON.stringify(p)
      });
      toast.success(editing.id ? "Product updated" : "Product created");
      setEditing(null);
      reload();
    } catch (e2) {
      toast.error(message(e2));
    } finally {
      setBusy(false);
    }
  }

  async function saveCategory(e) {
    e.preventDefault();
    if (!cat || uploading > 0) return;
    if (!cat.image_url) return toast.error("Upload a category image first");
    setBusy(true);
    try {
      await api("/admin/categories" + (cat.id ? "/" + cat.id : ""), {
        method: cat.id ? "PUT" : "POST",
        body: JSON.stringify(cat)
      });
      toast.success("Category saved");
      setCat(null);
      reload();
    } catch (e2) {
      toast.error(message(e2));
    } finally {
      setBusy(false);
    }
  }

  async function remove(kind, id) {
    if (!window.confirm(kind === "products" ? "Archive this product? Existing orders are preserved." : "Delete this empty category?")) return;
    try {
      await api("/admin/" + kind + "/" + id, { method: "DELETE" });
      toast.success("Updated");
      reload();
    } catch (e) { toast.error(message(e)); }
  }

  function edit(p) {
    const specsObj = parseJson(p.specifications, {});
    setEditing({
      ...blank,
      ...p,
      images: parseJson(p.images, []),
      video_urls: parseJson(p.video_urls, []),
      highlights: parseJson(p.highlights, []).length ? parseJson(p.highlights, []) : [""],
      specifications: Object.keys(specsObj).length ? Object.entries(specsObj).map(([key, value]) => ({ key, value })) : [{ key: "", value: "" }],
      price: String(p.price_paise / 100),
      original: p.original_price_paise ? String(p.original_price_paise / 100) : "",
      gst_percent: String(p.gst_percent ?? "18.00")
    });
  }

  const current = tab === "products" ? products : tab === "categories" ? categories : orders;

  return <div className="admin">
      <header className="admin-header">
        <Logo textOnly />
        <span className="owner-label">SELLER CENTER</span>
        <div className="admin-header-actions"><ThemeToggle /><Link className="button outline small" to="/">View store <ArrowUpRight size={16} /></Link></div>
        <button className="icon-button" aria-label="Sign out" onClick={async () => {
          try { await s.logout(); nav("/auth"); } catch (e) { toast.error(message(e)); }
        }}><LogOut size={18} /></button>
      </header>

      <div className="container admin-page">
        <div className="section-heading row admin-hero-card">
          <div><span className="eyebrow">WELCOME BACK, SELLER</span><h1>Electronics <span className="gradient-text">seller workspace.</span></h1><p>Catalogue, model numbers, media, inventory and orders — managed from one place.</p></div>
          <button className="button outline" onClick={reload}>Refresh</button>
        </div>
        {summary.error && <p className="error-text">{summary.error}</p>}
        <div className="stats-grid admin-animated-grid">
          {[
            ["Products", summary.data?.products, Package],
            ["Customers", summary.data?.customers, Boxes],
            ["Orders", summary.data?.orders, ShoppingBag],
            ["Low stock", summary.data?.lowStock, AlertTriangle],
            ["Captured sales", summary.data ? money(summary.data.revenuePaise) : undefined, BadgeIndianRupee]
          ].map(([name, val, Icon], i) => <div className="glass-card stat admin-stat-card" style={{ "--delay": `${i * 55}ms` }} key={String(name)}><Icon size={19}/><small>{name}</small><strong>{val ?? "—"}</strong></div>)}
        </div>

        <div className="admin-tabs">
          {[["products","Products",Package],["categories","Categories",Layers],["orders","Orders",ShoppingBag]].map(([id,label,Icon]) => <button key={id} className={tab===id?"active":""} onClick={()=>{setTab(id);setEditing(null);setCat(null);setSelectedOrder(null);}}><Icon size={18}/>{label}</button>)}
        </div>

        {editing ? <form className="admin-product-editor" onSubmit={saveProduct}>
            <div className="admin-editor-toolbar">
              <div><span className="eyebrow">CATALOGUE LISTING</span><h2>{editing.id ? "Edit product" : "Add new electronic product"}</h2><p>{editing.id ? `Model ${editing.model_number || "not set"}` : "Complete the listing information customers need before buying."}</p></div>
              <div className="admin-toolbar-actions">
                {editing.id && <Link className="button outline small" to={`/product/${editing.id}`} target="_blank"><Eye size={16}/> Preview</Link>}
                <button type="button" className="button outline small" disabled={busy || uploading>0} onClick={()=>setEditing(null)}><X size={16}/> Cancel</button>
                <button className="button small" disabled={busy || uploading>0}><Save size={16}/>{busy?"Saving…":"Save product"}</button>
              </div>
            </div>

            <div className="admin-editor-layout">
              <div className="admin-editor-main">
                <ProductSection icon={Info} title="Basic product information" hint="Brand, model number, SKU and customer-facing title">
                  <div className="admin-form-grid cols-2">
                    <Field label="Product name"><input required maxLength={160} value={editing.name} onChange={(e)=>setEditing({...editing,name:e.target.value})} placeholder="e.g. ASUS Vivobook 14 AI Laptop"/></Field>
                    <Field label="Brand"><input required maxLength={80} value={editing.brand} onChange={(e)=>setEditing({...editing,brand:e.target.value})} placeholder="ASUS"/></Field>
                    <Field label="Model number" hint="Shown on the product page and invoice"><input required maxLength={100} value={editing.model_number} onChange={(e)=>setEditing({...editing,model_number:e.target.value})} placeholder="X1407CA-LY102WS"/></Field>
                    <Field label="Seller SKU" hint="Unique stock-keeping code"><div className="input-action"><input required maxLength={80} value={editing.sku} onChange={(e)=>setEditing({...editing,sku:e.target.value.toUpperCase().replace(/\s+/g,"-")})} placeholder="ASUS-X1407-16-512"/><button type="button" onClick={()=>setEditing({...editing,sku:`EH-${Date.now().toString(36).toUpperCase()}`})}><Sparkles size={15}/> Generate</button></div></Field>
                    <Field label="Category"><select required value={editing.category_id} onChange={(e)=>setEditing({...editing,category_id:e.target.value})}><option value="">Choose electronics category</option>{categories.data?.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
                    <Field label="Badge"><input maxLength={30} value={editing.badge} onChange={(e)=>setEditing({...editing,badge:e.target.value})} placeholder="Bestseller / New arrival"/></Field>
                  </div>
                  <Field label="Description"><textarea required maxLength={10000} rows={6} value={editing.description} onChange={(e)=>setEditing({...editing,description:e.target.value})} placeholder="Detailed product description, key use cases and package information…"/></Field>
                </ProductSection>

                <ProductSection icon={BadgeIndianRupee} title="Price, tax & inventory" hint="Selling price, MRP, stock and ordering limits">
                  <div className="admin-form-grid cols-3">
                    <Field label="Selling price (₹)"><input required type="number" min="0.01" max="10000000" step="0.01" value={editing.price} onChange={(e)=>setEditing({...editing,price:e.target.value})}/></Field>
                    <Field label="MRP / Original price (₹)"><input type="number" min={editing.price||0} max="10000000" step="0.01" value={editing.original} onChange={(e)=>setEditing({...editing,original:e.target.value})}/></Field>
                    <Field label="GST (%)"><input required type="number" min="0" max="28" step="0.01" value={editing.gst_percent} onChange={(e)=>setEditing({...editing,gst_percent:e.target.value})}/></Field>
                    <Field label="Available stock"><input required type="number" min="0" max="1000000" value={editing.stock} onChange={(e)=>setEditing({...editing,stock:Number(e.target.value)})}/></Field>
                    <Field label="Low-stock alert at"><input required type="number" min="0" max="1000000" value={editing.low_stock_threshold} onChange={(e)=>setEditing({...editing,low_stock_threshold:Number(e.target.value)})}/></Field>
                    <Field label="Max qty per order"><input required type="number" min="1" max="10" value={editing.max_order_quantity} onChange={(e)=>setEditing({...editing,max_order_quantity:Number(e.target.value)})}/></Field>
                    <Field label="HSN code"><input maxLength={20} value={editing.hsn_code} onChange={(e)=>setEditing({...editing,hsn_code:e.target.value})} placeholder="84713010"/></Field>
                    <Field label="Shipping weight (grams)"><input type="number" min="0" max="100000" value={editing.shipping_weight_grams} onChange={(e)=>setEditing({...editing,shipping_weight_grams:Number(e.target.value)})}/></Field>
                    <Field label="Country of origin"><input required maxLength={80} value={editing.country_of_origin} onChange={(e)=>setEditing({...editing,country_of_origin:e.target.value})}/></Field>
                  </div>
                </ProductSection>

                <ProductSection icon={Package} title="Variant, warranty & fulfilment" hint="Color, configuration, warranty, returns and delivery options">
                  <div className="admin-form-grid cols-3">
                    <Field label="Color"><input maxLength={60} value={editing.color} onChange={(e)=>setEditing({...editing,color:e.target.value})} placeholder="Quiet Blue"/></Field>
                    <Field label="Variant / Configuration"><input maxLength={120} value={editing.variant_label} onChange={(e)=>setEditing({...editing,variant_label:e.target.value})} placeholder="16 GB RAM / 512 GB SSD"/></Field>
                    <Field label="Warranty (months)"><input type="number" min="0" max="120" value={editing.warranty_months} onChange={(e)=>setEditing({...editing,warranty_months:Number(e.target.value)})}/></Field>
                    <Field label="Return / Replacement days"><input type="number" min="0" max="30" value={editing.return_days} onChange={(e)=>setEditing({...editing,return_days:Number(e.target.value)})}/></Field>
                  </div>
                  <div className="checkboxes admin-switches">
                    <label><input type="checkbox" checked={editing.cod_available} onChange={(e)=>setEditing({...editing,cod_available:e.target.checked})}/><span>Cash on delivery available</span></label>
                    <label><input type="checkbox" checked={editing.installation_required} onChange={(e)=>setEditing({...editing,installation_required:e.target.checked})}/><span>Installation / setup required</span></label>
                  </div>
                </ProductSection>

                <ProductSection icon={ListPlus} title="Highlights & specifications" hint="Structured details used on the product page">
                  <h4 className="admin-subheading">Product highlights</h4>
                  <div className="admin-repeat-list">
                    {editing.highlights.map((value,i)=><div className="admin-repeat-row" key={`highlight-${i}`}><input maxLength={220} value={value} onChange={(e)=>setEditing({...editing,highlights:editing.highlights.map((v,j)=>j===i?e.target.value:v)})} placeholder={`Highlight ${i+1} — e.g. Intel Core Ultra 5 processor`}/><button type="button" aria-label="Remove highlight" onClick={()=>setEditing({...editing,highlights:editing.highlights.filter((_,j)=>j!==i).length?editing.highlights.filter((_,j)=>j!==i):[""]})}><Trash2 size={16}/></button></div>)}
                    {editing.highlights.length<10 && <button type="button" className="admin-add-row" onClick={()=>setEditing({...editing,highlights:[...editing.highlights,""]})}><Plus size={16}/> Add highlight</button>}
                  </div>
                  <h4 className="admin-subheading">Technical specifications</h4>
                  <div className="admin-repeat-list">
                    {editing.specifications.map((row,i)=><div className="admin-repeat-row spec-row" key={`spec-${i}`}><input maxLength={80} value={row.key} onChange={(e)=>setEditing({...editing,specifications:editing.specifications.map((r,j)=>j===i?{...r,key:e.target.value}:r)})} placeholder="Specification e.g. Processor"/><input maxLength={240} value={row.value} onChange={(e)=>setEditing({...editing,specifications:editing.specifications.map((r,j)=>j===i?{...r,value:e.target.value}:r)})} placeholder="Value e.g. Intel Core Ultra 5 225H"/><button type="button" aria-label="Remove specification" onClick={()=>setEditing({...editing,specifications:editing.specifications.filter((_,j)=>j!==i).length?editing.specifications.filter((_,j)=>j!==i):[{key:"",value:""}]})}><Trash2 size={16}/></button></div>)}
                    {editing.specifications.length<30 && <button type="button" className="admin-add-row" onClick={()=>setEditing({...editing,specifications:[...editing.specifications,{key:"",value:""}]})}><Plus size={16}/> Add specification</button>}
                  </div>
                </ProductSection>

                <ProductSection icon={ImageIcon} title="Images & product videos" hint="Main image, gallery angles and up to 3 demo videos">
                  <div className="admin-media-grid"><UploadField onBusyChange={uploadBusy} label="Main product image" value={editing.image_url} onChange={(url)=>setEditing((p)=>p?{...p,image_url:url}:p)}/><div className="admin-main-preview">{editing.image_url ? <Photo src={editing.image_url} alt="Main product preview"/> : <span><ImageIcon size={28}/>Main image preview</span>}</div></div>
                  <h4 className="admin-subheading">Gallery</h4>
                  <div className="gallery-editor admin-gallery-editor">{editing.images.map((url,i)=><div key={`${url}-${i}`}><Photo src={url} alt={`Gallery image ${i+1}`}/><button type="button" className="icon-button" aria-label="Remove gallery image" onClick={()=>setEditing({...editing,images:editing.images.filter((_,j)=>j!==i)})}><Trash2 size={16}/></button></div>)}</div>
                  {editing.images.length<8 && <MultiUploadField onBusyChange={uploadBusy} label="Add gallery photos" remaining={8-editing.images.length} onAdd={(urls)=>setEditing((p)=>p?{...p,images:Array.from(new Set([...p.images,...urls])).slice(0,8)}:p)}/>} 
                  <h4 className="admin-subheading">Product videos</h4>
                  <div className="admin-video-grid">{editing.video_urls.map((url,i)=><div className="admin-video-card" key={`${url}-${i}`}><video src={url} controls preload="metadata"/><button type="button" onClick={()=>setEditing({...editing,video_urls:editing.video_urls.filter((_,j)=>j!==i)})}><Trash2 size={15}/> Remove</button></div>)}</div>
                  {editing.video_urls.length<3 && <VideoUploadField onBusyChange={uploadBusy} remaining={3-editing.video_urls.length} onAdd={(url)=>setEditing((p)=>p?{...p,video_urls:[...p.video_urls,url].slice(0,3)}:p)}/>} 
                </ProductSection>

                <ProductSection icon={ShieldCheck} title="Listing visibility" hint="Choose how this item appears in the storefront">
                  <div className="checkboxes admin-switches">
                    {["featured","deal","active"].map((k)=><label key={k}><input type="checkbox" checked={editing[k]} onChange={(e)=>setEditing({...editing,[k]:e.target.checked})}/><span>{{featured:"Featured product",deal:"Flash deal / special offer",active:"Visible in store"}[k]}</span></label>)}
                  </div>
                </ProductSection>
              </div>

              <aside className="admin-editor-aside">
                <div className="glass-card admin-listing-health"><h3>Listing readiness</h3>{[
                  [editing.name,"Product name"],[editing.brand,"Brand"],[editing.model_number,"Model number"],[editing.sku,"SKU"],[editing.category_id,"Category"],[editing.price,"Selling price"],[editing.image_url,"Main image"],[editing.highlights.some(Boolean),"Highlights"],[editing.specifications.some((r)=>r.key&&r.value),"Specifications"]
                ].map(([ok,label])=><div key={label} className={ok?"done":"pending"}><span>{ok?"✓":"•"}</span>{label}</div>)}<small>Complete more details for a stronger electronics listing.</small></div>
                <div className="glass-card admin-mini-preview"><span>STORE PREVIEW</span>{editing.image_url?<Photo src={editing.image_url} alt="Listing preview"/>:<div className="image-missing"><ImageIcon/><small>Add image</small></div>}<b>{editing.name||"Product title"}</b><small>{editing.brand||"Brand"} {editing.model_number&&`· ${editing.model_number}`}</small><strong>{editing.price?money(Math.round(Number(editing.price)*100)):"₹0"}</strong>{editing.variant_label&&<em>{editing.variant_label}</em>}</div>
              </aside>
            </div>

            <div className="admin-editor-bottom"><span>{uploading>0?"Media upload in progress…":"All changes are saved only when you press Save product."}</span><button className="button" disabled={busy||uploading>0}><Save size={17}/>{busy?"Saving…":"Save product"}</button></div>
          </form>

        : cat ? <form className="glass-card editor narrow admin-fade-in" onSubmit={saveCategory}>
            <h2>{cat.id?"Edit category":"Add category"}</h2>
            <label>Name<input required maxLength={80} value={cat.name} onChange={(e)=>setCat({...cat,name:e.target.value})}/></label>
            <label>Description<textarea maxLength={500} value={cat.description} onChange={(e)=>setCat({...cat,description:e.target.value})}/></label>
            <UploadField onBusyChange={uploadBusy} label="Category photograph" value={cat.image_url} onChange={(image_url)=>setCat((c)=>c?{...c,image_url}:c)}/>
            <div className="actions"><button className="button" disabled={busy||uploading>0}>{busy?"Saving…":"Save category"}</button><button type="button" className="button outline" disabled={busy||uploading>0} onClick={()=>setCat(null)}>Cancel</button></div>
          </form>

        : <>
            <div className="row admin-content-head"><h2>{tab==="products"?"Product collection":tab==="categories"?"Shop categories":"Customer orders"}</h2>{tab!=="orders"&&<button className="button" onClick={()=>tab==="products"?setEditing({...blank,highlights:[""],specifications:[{key:"",value:""}]}):setCat({name:"",description:"",image_url:""})}><Plus size={18}/>Add {tab==="products"?"product":"category"}</button>}</div>

            {tab==="products" && <div className="admin-product-tools glass-card"><div className="admin-search"><Search size={17}/><input value={productQuery} onChange={(e)=>setProductQuery(e.target.value)} placeholder="Search product, brand, model no. or SKU"/></div><label className="admin-filter-check"><input type="checkbox" checked={inventoryOnly} onChange={(e)=>setInventoryOnly(e.target.checked)}/><AlertTriangle size={16}/> Low stock only</label><span>{visibleProducts.length} listing{visibleProducts.length===1?"":"s"}</span></div>}

            {current.loading?<Loading/>:current.error?<ErrorState error={current.error} retry={current.reload}/>:tab==="products"?<div className="table-wrap glass-card admin-fade-in"><table><thead><tr><th>Product</th><th>Model / SKU</th><th>Price</th><th>Stock</th><th>Visibility</th><th>Actions</th></tr></thead><tbody>{visibleProducts.map((p)=><tr key={p.id} className={Number(p.stock)<=Number(p.low_stock_threshold||0)?"low-stock-row":""}><td><div className="table-product"><Photo src={p.image_url} alt={p.name}/><div><b>{p.name}</b><small>{p.brand||p.category_name} · {p.category_name}</small></div></div></td><td><div className="admin-code-cell"><b>{p.model_number||"—"}</b><small>{p.sku||"SKU not set"}</small></div></td><td className="cyan">{money(p.price_paise)}</td><td><span className={Number(p.stock)<=Number(p.low_stock_threshold||0)?"stock-pill low":"stock-pill"}>{p.stock}{Number(p.stock)<=Number(p.low_stock_threshold||0)&&<AlertTriangle size={13}/>}</span></td><td>{p.active?"Active":"Archived"}{p.deal&&" · Deal"}{p.featured&&" · Featured"}</td><td><div className="admin-action-row"><Link className="icon-button" to={`/product/${p.id}`} target="_blank" aria-label={`Preview ${p.name}`}><Eye size={17}/></Link><button className="icon-button" aria-label={`Copy model number ${p.name}`} onClick={()=>{window.navigator.clipboard?.writeText(p.model_number||p.id);toast.success("Copied");}}><Copy size={17}/></button><button className="icon-button" aria-label={`Edit ${p.name}`} onClick={()=>edit(p)}><Pencil size={17}/></button><button className="icon-button" aria-label={`Archive ${p.name}`} onClick={()=>remove("products",p.id)}><Trash2 size={17}/></button></div></td></tr>)}</tbody></table>{!visibleProducts.length&&<p className="state">No products match this filter.</p>}</div>

            :tab==="categories"?<div className="category-grid admin-categories admin-fade-in">{categories.data?.map((c)=><article key={c.id} className="glass-card"><Photo src={c.image_url} alt={c.name}/><div className="row"><div><h3>{c.name}</h3><small>{c.product_count} products</small></div><div><button className="icon-button" aria-label={`Edit ${c.name}`} onClick={()=>setCat(c)}><Pencil size={17}/></button><button className="icon-button" aria-label={`Delete ${c.name}`} onClick={()=>remove("categories",c.id)}><Trash2 size={17}/></button></div></div></article>)}</div>

            :<><div className="table-wrap glass-card admin-fade-in"><table><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Action</th></tr></thead><tbody>{orders.data?.map((o)=><tr key={o.id}><td><button className="text-button" onClick={async()=>{try{setOrderItems(await api(`/admin/orders/${o.id}/items`));setSelectedOrder(o);}catch(e){toast.error(message(e));}}}>#{o.id.slice(0,8)}</button></td><td>{o.email}</td><td>{money(o.amount_paise)}</td><td><Status status={o.status}/></td><td>{["PAID","PROCESSING","SHIPPED"].includes(o.status)?<button className="button outline small" disabled={busy||uploading>0} onClick={async()=>{setBusy(true);try{await api(`/admin/orders/${o.id}`,{method:"PATCH",body:JSON.stringify({status:{PAID:"PROCESSING",PROCESSING:"SHIPPED",SHIPPED:"DELIVERED"}[o.status]})});reload();}catch(e){toast.error(message(e));}finally{setBusy(false);}}}>{{PAID:"Process",PROCESSING:"Ship",SHIPPED:"Deliver"}[o.status]}</button>:o.status==="PAID_REVIEW"?<small>Contact customer</small>:"—"}</td></tr>)}</tbody></table>{!orders.data?.length&&<p className="state">No orders yet.</p>}</div>{selectedOrder&&<div className="glass-card profile admin-fade-in"><div className="row"><h3>Order #{selectedOrder.id.slice(0,8)}</h3><button className="button outline small" onClick={()=>setSelectedOrder(null)}>Close</button></div><p>{selectedOrder.recipient} · {selectedOrder.phone}<br/>{selectedOrder.address} — {selectedOrder.pincode}</p><small>Payment: {selectedOrder.payment_id||"Not confirmed"}</small>{orderItems.map((i)=><div className="summary-line" key={i.id}><span>{i.name} × {i.quantity}</span><b>{money(i.quantity*i.price_paise)}</b></div>)}{selectedOrder.status==="PAID_REVIEW"&&<p className="notice">Payment was captured but stock was unavailable. Resolve with the customer; issue any refund through the Razorpay dashboard.</p>}</div>}</>}
          </>}
      </div>
    </div>;
}

export { Admin as default };
