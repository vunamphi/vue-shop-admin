// src/store/cart.js
import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";

export const useCartStore = defineStore("cart", () => {
  // 🛒 Load cart từ localStorage
  const cart = ref(JSON.parse(localStorage.getItem("cart") || "[]"));
  const paymentMethod = ref("");
  const orderCode = ref("");

  // 💰 Tổng tiền
  const totalPrice = computed(() =>
    cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  // 🧩 Lưu tự động mỗi khi giỏ hàng thay đổi
  watch(
    cart,
    (newVal) => {
      localStorage.setItem("cart", JSON.stringify(newVal));
    },
    { deep: true }
  );

  // ➕ Thêm sản phẩm
  function addToCart(product, quantity = 1) {
    const existing = cart.value.find((item) => item.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.value.push({ ...product, quantity });
    }
  }

  // ➖ Giảm số lượng
  function decreaseQuantity(id) {
    const item = cart.value.find((i) => i.id === id);
    if (item && item.quantity > 1) item.quantity--;
  }

  // ➕ Tăng số lượng
  function increaseQuantity(id) {
    const item = cart.value.find((i) => i.id === id);
    if (item) item.quantity++;
  }

  // 🔢 Kiểm tra số lượng khi nhập tay
  function validateQuantity(id) {
    const item = cart.value.find((i) => i.id === id);
    if (item && (!item.quantity || item.quantity < 1)) item.quantity = 1;
  }

  // ❌ Xóa 1 sản phẩm
  function removeFromCart(id) {
    cart.value = cart.value.filter((item) => item.id !== id);
  }

  // 🧹 Xóa toàn bộ giỏ
  function clearCart() {
    cart.value = [];
  }

  // 🆔 Sinh mã đơn hàng
  function generateOrderCode() {
    orderCode.value = Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  return {
    cart,
    totalPrice,
    paymentMethod,
    orderCode,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    validateQuantity,
    removeFromCart,
    clearCart,
    generateOrderCode,
  };
});
