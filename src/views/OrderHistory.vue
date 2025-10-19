<template>
  <div class="container py-5">
    <h2 class="text-center mb-4 fw-bold">🧾 Lịch Sử Đơn Hàng</h2>

    <div v-if="orderStore.loading" class="text-center text-muted">
      Đang tải dữ liệu...
    </div>

    <div v-else-if="orders.length === 0" class="alert alert-info text-center">
      🛒 Bạn chưa có đơn hàng nào.
    </div>

    <div v-else class="table-responsive">
      <table class="table table-bordered align-middle text-center">
        <thead class="table-light">
          <tr>
            <th>Mã Đơn</th>
            <th>Tổng Tiền</th>
            <th>Phương Thức</th>
            <th>Trạng Thái</th>
            <th>Ngày Tạo</th>
            <th>Chi Tiết</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id || order._id">
            <td>{{ order.orderCode || order.id || order._id }}</td>
            <td>{{ formatPrice(order.totalPrice) }}</td>
            <td>{{ order.paymentMethod }}</td>
            <td><span :class="statusClass(order.status)">{{ order.status }}</span></td>
            <td>{{ new Date(order.createdAt).toLocaleString() }}</td>
            <td>
              <button class="btn btn-outline-primary btn-sm" @click="showOrderDetail(order)">
                <i class="bi bi-eye"></i> Xem
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useOrderStore } from "@/store/order";

const orderStore = useOrderStore();
const { orders } = orderStore;

onMounted(async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.id) {
    await orderStore.fetchUserOrders(user.id);
  } else {
    alert("⚠️ Vui lòng đăng nhập để xem lịch sử đơn hàng!");
  }
});

function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN").format(value) + "₫";
}

function showOrderDetail(order) {
  const detail = order.cart
    ?.map((item) => `• ${item.name} × ${item.quantity}`)
    .join("\n");
  alert(`🧾 Mã đơn: ${order.orderCode}\n${detail}\n\nTổng: ${formatPrice(order.totalPrice)}\nTrạng thái: ${order.status}`);
}

function statusClass(status) {
  return {
    "text-warning fw-bold": status === "Chờ xử lý",
    "text-primary fw-bold": status === "Đang giao",
    "text-success fw-bold": status === "Hoàn thành",
    "text-danger fw-bold": status === "Đã hủy",
  };
}
</script>
