import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import { api, post, refreshCsrf } from "../services/api";
const Context = createContext(null);
function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
function StoreProvider({ children }) {
  const [user, setUser] = useState(null), [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    const saved = read("electrohub-theme", "light");
    return saved === "dark" ? "dark" : "light";
  });
  const [cart, setCart] = useState(() => {
    const v = read("electrohub-cart", []);
    return Array.isArray(v) ? v.filter(
      (x) => x && typeof x.productId === "string" && Number.isInteger(x.quantity) && x.quantity > 0 && x.quantity <= 10
    ) : [];
  });
  const [likes, setLikes] = useState(() => {
    const v = read("electrohub-likes", []);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  });
  useEffect(() => {
    api("/auth/me").then(setUser).catch(() => {
    }).finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("electrohub-theme", JSON.stringify(theme));
  }, [theme]);
  useEffect(() => {
    localStorage.setItem("electrohub-cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem("electrohub-likes", JSON.stringify(likes));
  }, [likes]);
  async function login(email, password) {
    const u = await post("/auth/login", { email, password });
    setUser(u);
    await refreshCsrf();
    return u;
  }
  async function startRegistration(name, email, phone, password) {
    return post("/auth/register/start", { name, email, phone, password });
  }
  async function verifyRegistration(registrationId, channel, code) {
    const result = await post("/auth/register/verify", { registrationId, channel, code });
    if (result.complete && result.user) {
      setUser(result.user);
      await refreshCsrf();
    }
    return result;
  }
  async function resendRegistrationOtp(registrationId, channel) {
    const r = await post("/auth/register/resend", { registrationId, channel });
    return r.message;
  }
  async function requestOtp(channel, destination) {
    const r = await post("/auth/otp/request", { channel, destination });
    return r.message;
  }
  async function verifyOtp(channel, destination, code) {
    const u = await post("/auth/otp/verify", { channel, destination, code });
    setUser(u);
    await refreshCsrf();
    return u;
  }
  async function logout() {
    await api("/auth/logout", { method: "POST" });
    setUser(null);
    setCart([]);
    setLikes([]);
    await refreshCsrf();
  }
  function setQuantity(id, n) {
    setCart((c) => {
      const others = c.filter((x) => x.productId !== id);
      return n > 0 ? [...others, { productId: id, quantity: Math.min(10, n) }] : others;
    });
  }
  return <Context.Provider
    value={{
      user,
      loading,
      theme,
      cart,
      likes,
      login,
      startRegistration,
      verifyRegistration,
      resendRegistrationOtp,
      requestOtp,
      verifyOtp,
      logout,
      toggleTheme: () => setTheme((current) => current === "dark" ? "light" : "dark"),
      setQuantity,
      clearCart: () => setCart([]),
      toggleLike: (id) => setLikes(
        (a) => a.includes(id) ? a.filter((x) => x !== id) : [...a, id]
      )
    }}
  >
      {children}
    </Context.Provider>;
}
function useStore() {
  const s = useContext(Context);
  if (!s) throw new Error("Store provider missing");
  return s;
}
export {
  StoreProvider,
  useStore
};
