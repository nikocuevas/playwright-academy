"use client";

import * as React from "react";

export type ShopUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
};

export type CartItem = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type Cart = {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
};

type ShopContextValue = {
  user: ShopUser | null;
  cart: Cart;
  loading: boolean;
  refreshSession: () => Promise<void>;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  setQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  logout: () => Promise<void>;
};

const emptyCart: Cart = { items: [], subtotal: 0, shipping: 0, tax: 0, total: 0 };

const ShopContext = React.createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<ShopUser | null>(null);
  const [cart, setCart] = React.useState<Cart>(emptyCart);
  const [loading, setLoading] = React.useState(true);

  const refreshSession = React.useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      const body = await response.json();
      setUser(body.user ?? null);
    } catch {
      setUser(null);
    }
  }, []);

  const refreshCart = React.useCallback(async () => {
    try {
      const response = await fetch("/api/cart", { cache: "no-store" });
      const body = await response.json();
      setCart(body.cart ?? emptyCart);
    } catch {
      setCart(emptyCart);
    }
  }, []);

  React.useEffect(() => {
    void (async () => {
      await Promise.all([refreshSession(), refreshCart()]);
      setLoading(false);
    })();
  }, [refreshSession, refreshCart]);

  const value = React.useMemo<ShopContextValue>(
    () => ({
      user,
      cart,
      loading,
      refreshSession,
      refreshCart,
      async addToCart(productId, quantity = 1) {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        });
        const body = await response.json();
        if (body.cart) setCart(body.cart);
      },
      async setQuantity(productId, quantity) {
        const response = await fetch("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        });
        const body = await response.json();
        if (body.cart) setCart(body.cart);
      },
      async removeFromCart(productId) {
        const response = await fetch(
          `/api/cart?productId=${encodeURIComponent(productId)}`,
          { method: "DELETE" },
        );
        const body = await response.json();
        if (body.cart) setCart(body.cart);
      },
      async logout() {
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
        setCart(emptyCart);
      },
    }),
    [user, cart, loading, refreshSession, refreshCart],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = React.useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used inside a ShopProvider");
  }
  return context;
}

/** Redirects to the login page when the session is missing. */
export function useRequireAuth() {
  const { user, loading } = useShop();

  React.useEffect(() => {
    if (!loading && !user) {
      window.location.replace("/practice/shop/login?next=" + encodeURIComponent(window.location.pathname));
    }
  }, [loading, user]);

  return { user, loading };
}
