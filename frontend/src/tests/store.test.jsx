import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup
} from "@testing-library/react";
import { StoreProvider, useStore } from "../context/StoreContext";
import { money } from "../utils/format";
import { upload } from "../services/api";
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ id: "customer", name: "Test", role: "CUSTOMER" }),
      json: async () => ({ token: "csrf", headerName: "X-CSRF-TOKEN" })
    })
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function CartHarness() {
  const s = useStore();
  return <>
      <span data-testid="ready">{s.loading ? "loading" : "ready"}</span>
      <span data-testid="count">{s.cart[0]?.quantity || 0}</span>
      <button onClick={() => s.setQuantity("product", 100)}>Add</button>
      <button onClick={() => s.setQuantity("product", 0)}>Remove</button>
      <button onClick={() => s.toggleLike("product")}>Save</button>
      <span data-testid="saved">{s.likes.length}</span>
    </>;
}
describe("Store behaviour", () => {
  it("caps cart quantity, persists it and removes items", async () => {
    render(
      <StoreProvider>
        <CartHarness />
      </StoreProvider>
    );
    await waitFor(
      () => expect(screen.getByTestId("ready").textContent).toBe("ready")
    );
    fireEvent.click(screen.getByText("Add"));
    expect(screen.getByTestId("count").textContent).toBe("10");
    await waitFor(
      () => expect(
        JSON.parse(localStorage.getItem("electrohub-cart") || "[]")[0].quantity
      ).toBe(10)
    );
    fireEvent.click(screen.getByText("Remove"));
    await waitFor(
      () => expect(screen.getByTestId("ready").textContent).toBe("ready")
    );
    expect(screen.getByTestId("count").textContent).toBe("0");
  });
  it("toggles saved products", async () => {
    render(
      <StoreProvider>
        <CartHarness />
      </StoreProvider>
    );
    await waitFor(
      () => expect(screen.getByTestId("ready").textContent).toBe("ready")
    );
    fireEvent.click(screen.getByText("Save"));
    expect(screen.getByTestId("saved").textContent).toBe("1");
    fireEvent.click(screen.getByText("Save"));
    expect(screen.getByTestId("saved").textContent).toBe("0");
  });
  it("ignores invalid persisted cart records", async () => {
    localStorage.setItem(
      "electrohub-cart",
      JSON.stringify([{ productId: "x", quantity: -1 }])
    );
    render(
      <StoreProvider>
        <CartHarness />
      </StoreProvider>
    );
    await waitFor(
      () => expect(screen.getByTestId("ready").textContent).toBe("ready")
    );
    expect(screen.getByTestId("count").textContent).toBe("0");
  });
  it("formats paise as rupees", () => {
    expect(money(2499900)).toBe("\u20B924,999.00");
  });
  it("rejects non-image uploads before sending", async () => {
    await expect(
      upload(new File(["x"], "payload.html", { type: "text/html" }))
    ).rejects.toThrow("JPG or PNG");
  });
});
