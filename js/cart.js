// Shared cart logic, stored in localStorage. Used by shop.html and
// checkout.html. Cart items are keyed by product slug so pricing is always
// re-verified server-side at checkout — this local copy is only a display
// convenience.
(function () {
  const STORAGE_KEY = 'ct_cart_v1';

  function readCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  function writeCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();
  }

  function addToCart(slug, quantity) {
    const cart = readCart();
    cart[slug] = (cart[slug] || 0) + quantity;
    if (cart[slug] < 1) delete cart[slug];
    writeCart(cart);
  }

  function setQuantity(slug, quantity) {
    const cart = readCart();
    if (quantity < 1) {
      delete cart[slug];
    } else {
      cart[slug] = quantity;
    }
    writeCart(cart);
  }

  function removeFromCart(slug) {
    const cart = readCart();
    delete cart[slug];
    writeCart(cart);
  }

  function clearCart() {
    writeCart({});
  }

  function cartCount() {
    const cart = readCart();
    return Object.values(cart).reduce((sum, q) => sum + q, 0);
  }

  function updateCartCount() {
    const el = document.querySelector('[data-cart-count]');
    if (!el) return;
    const count = cartCount();
    el.textContent = String(count);
    el.style.display = count > 0 ? 'inline-flex' : 'none';
  }

  window.CTCart = { readCart, writeCart, addToCart, setQuantity, removeFromCart, clearCart, cartCount, updateCartCount };

  document.addEventListener('DOMContentLoaded', updateCartCount);
})();
