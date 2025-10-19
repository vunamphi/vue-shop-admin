<template>
  <div class="container py-5">
    <h2 class="text-center mb-4 fw-bold">🧾 Thanh Toán Đơn Hàng</h2>

    <div v-if="order" class="card shadow p-4 border-0">
      <h5 class="mb-3">
        Mã đơn tạm: <strong>{{ order.orderCode || "Chưa có" }}</strong>
      </h5>

      <!-- Bảng sản phẩm -->
      <table class="table table-bordered align-middle">
        <thead class="table-light">
          <tr>
            <th>Sản phẩm</th>
            <th>Số lượng</th>
            <th>Giá</th>
            <th>Tổng</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in order.cart" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ formatPrice(item.price) }}</td>
            <td>{{ formatPrice(item.price * item.quantity) }}</td>
          </tr>
        </tbody>
      </table>

      <h5 class="text-end mt-3">
        Tổng tiền: <span class="text-danger fw-bold">{{ formatPrice(order.totalPrice) }}</span>
      </h5>

      <!-- Thông tin nhận hàng -->
      <div class="mt-4">
        <h5 class="fw-bold mb-3">📦 Thông tin giao hàng</h5>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Họ và tên</label>
            <input v-model="shipping.fullName" type="text" class="form-control" placeholder="Nguyễn Văn A" required />
          </div>
          <div class="col-md-6">
            <label class="form-label">Số điện thoại</label>
            <input v-model="shipping.phone" type="tel" class="form-control" placeholder="0987xxxxxx" required />
          </div>
          <div class="col-12">
            <label class="form-label">Địa chỉ nhận hàng</label>
            <input v-model="shipping.address" type="text" class="form-control" placeholder="Số nhà, phường, quận, tỉnh..." required />
          </div>
          <div class="col-12">
            <label class="form-label">Ghi chú (tuỳ chọn)</label>
            <textarea v-model="shipping.note" class="form-control" rows="2" placeholder="Ví dụ: Giao giờ hành chính..."></textarea>
          </div>
        </div>
      </div>

      <!-- Phương thức thanh toán -->
      <div class="mt-4">
        <h5 class="fw-bold mb-3">💳 Phương thức thanh toán</h5>
        <select v-model="order.paymentMethod" class="form-select w-auto">
          <option value="cod">Thanh toán khi nhận hàng (COD)</option>
          <option value="vnpay">Thanh toán qua VNPay</option>
        </select>
      </div>

      <!-- Nút xác nhận -->
      <div class="d-flex justify-content-end gap-3 mt-4">
        <button class="btn btn-secondary" @click="cancelOrder">❌ Hủy</button>
        <button class="btn btn-success" @click="confirmPayment">✅ Xác nhận thanh toán</button>
      </div>
    </div>

    <div v-else class="text-center mt-5">
      <p>⚠️ Không có đơn hàng nào cần thanh toán.</p>
      <router-link to="/cart" class="btn btn-primary mt-3">Quay lại giỏ hàng</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "@/store/cart";
import axios from "axios";

const router = useRouter();
const cartStore = useCartStore();
const order = ref(JSON.parse(localStorage.getItem("pendingOrder")) || null);

const shipping = ref({
  fullName: "",
  phone: "",
  address: "",
  note: "",
});

function formatPrice(v) {
  return new Intl.NumberFormat("vi-VN").format(v) + " ₫";
}

function cancelOrder() {
  if (confirm("Bạn có chắc muốn hủy đơn hàng này không?")) {
    localStorage.removeItem("pendingOrder");
    router.push("/cart");
  }
}

async function confirmPayment() {
  if (!order.value) return alert("Không có đơn hàng nào!");

  // Kiểm tra nhập thông tin
  if (!shipping.value.fullName || !shipping.value.phone || !shipping.value.address) {
    alert("Vui lòng nhập đầy đủ thông tin giao hàng!");
    return;
  }

  try {
    const fullOrder = {
      ...order.value,
      user: order.value.user || "guest",
      shipping: shipping.value,
    };

    const res = await axios.post("http://localhost:3000/orders", fullOrder);

    // ✅ Xử lý kết quả
    if (fullOrder.paymentMethod === "vnpay" && res.data.paymentUrl) {
      window.location.href = res.data.paymentUrl;
    } else {
      alert("🎉 Đặt hàng thành công! Cảm ơn bạn đã mua sắm.");
      cartStore.clearCart();
      localStorage.removeItem("pendingOrder");
      router.push("/order-history");
    }
  } catch (err) {
    console.error("❌ Lỗi khi đặt hàng:", err);
    alert("Lỗi khi đặt hàng, vui lòng thử lại.");
  }
}
</script>

<style scoped>
.table td,
.table th {
  vertical-align: middle;
}
</style>
