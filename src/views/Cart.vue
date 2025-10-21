<template>
  <div class="container py-5">
    <h2 class="text-center mb-4 fw-bold">🛒 Giỏ Hàng Của Bạn</h2>

    <div v-if="cart.length === 0" class="alert alert-info text-center">
      <i class="bi bi-cart"></i> Giỏ hàng của bạn đang trống.
      <br />
      <RouterLink to="/orders" class="btn btn-outline-primary mt-3">
        📜 Xem lịch sử mua hàng
      </RouterLink>
    </div>

    <div v-else class="table-responsive">
      <table class="table align-middle text-center">
        <thead class="table-light">
          <tr>
            <th>Ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Giá</th>
            <th>Số lượng</th>
            <th>Tổng</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in cart" :key="item.id">
            <td>
              <img
                :src="item.images?.[0] || 'https://via.placeholder.com/80'"
                class="rounded"
                width="80"
                height="80"
              />
            </td>
            <td class="fw-semibold">{{ item.name }}</td>
            <td>{{ formatPrice(item.price) }}</td>
            <td>
              <div class="d-flex justify-content-center align-items-center gap-2">
                <button
                  class="btn btn-sm btn-outline-secondary"
                  @click="decreaseQuantity(item.id)"
                >
                  −
                </button>
                <input
                  type="number"
                  v-model.number="item.quantity"
                  @change="validateQuantity(item.id)"
                  class="form-control text-center"
                  style="width: 60px"
                  min="1"
                />
                <button
                  class="btn btn-sm btn-outline-secondary"
                  @click="increaseQuantity(item.id)"
                >
                  +
                </button>
              </div>
            </td>
            <td>{{ formatPrice(item.price * item.quantity) }}</td>
            <td>
              <button
                class="btn btn-sm btn-danger btn-delete"
                @click="confirmRemove(item.id)"
              >
                <i class="bi bi-trash"></i> Xóa
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="d-flex flex-column align-items-end mt-4">
        <div class="mb-3 w-100 text-end">
          <label class="form-label fw-semibold me-2">🎟️ Mã giảm giá:</label>
          <input
            v-model="discountCode"
            placeholder="Nhập mã giảm giá (vd: SALE10)"
            class="form-control d-inline-block w-auto"
          />
        </div>

        <h5 class="fw-bold">
          Tổng tiền: <span class="text-danger">{{ formatPrice(totalPrice) }}</span>
        </h5>

        <div class="mt-3">
          <label class="form-label fw-semibold">Phương thức thanh toán:</label>
          <select v-model="paymentMethod" class="form-select w-auto d-inline-block">
            <option value="">-- Chọn phương thức --</option>
            <option value="cod">💵 Thanh toán khi nhận hàng (COD)</option>
            <option value="vnpay">💳 Thanh toán qua VNPay</option>
          </select>
        </div>

        <div class="mt-4 d-flex gap-3">
          <button class="btn btn-primary px-4" @click="checkout">
            ✅ Xác nhận đặt hàng
          </button>
          <RouterLink to="/orders" class="btn btn-outline-success px-4">
            📜 Xem lịch sử mua hàng
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useCartStore } from "@/store/cart";
import { useOrderStore } from "@/store/order";

const orderStore = useOrderStore();
const router = useRouter();
const cartStore = useCartStore();
const { cart, totalPrice } = storeToRefs(cartStore);
const {
  increaseQuantity,
  decreaseQuantity,
  validateQuantity,
  removeFromCart,
  clearCart,
  generateOrderCode,
} = cartStore;

const paymentMethod = ref("");
const discountCode = ref("");

function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN").format(value) + "₫";
}

function confirmRemove(id) {
  if (confirm("🗑️ Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng không?")) {
    removeFromCart(id);
  }
}

async function checkout() {
  if (!paymentMethod.value) {
    alert("⚠️ Vui lòng chọn phương thức thanh toán!");
    return;
  }

  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("⚠️ Vui lòng đăng nhập để đặt hàng!");
    return;
  }

  let finalPrice = totalPrice.value;
  if (discountCode.value === "SALE10") {
    finalPrice *= 0.9;
    alert("🎉 Áp dụng mã SALE10: giảm 10%");
  }

  generateOrderCode();
  const order = {
    orderCode: cartStore.orderCode,
    userId: user.id,
    user: user.username || user.email,
    cart: cart.value,
    totalPrice: finalPrice,
    discountCode: discountCode.value,
    paymentMethod: paymentMethod.value,
    status: "Chờ xử lý",
    createdAt: new Date().toISOString(),
  };

  try {
    await orderStore.addOrder(order);
    // clearCart();
    alert("🎉 Đặt hàng thành công!");
    router.push("/orders");
  } catch (err) {
    console.error("❌ Lỗi đặt hàng:", err);
  }
}
</script>

<style scoped>
.table th,
.table td {
  vertical-align: middle;
}
.btn-delete {
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
}
.btn-delete:hover {
  transform: scale(1.03);
  background-color: #c82333 !important;
  color: white;
}
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
