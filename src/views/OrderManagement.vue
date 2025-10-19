<template>
  <div class="container py-5">
    <h2 class="text-center mb-4 fw-bold">📦 Quản Lý Đơn Hàng</h2>

    <div v-if="orderStore.loading" class="text-center text-muted">Đang tải dữ liệu...</div>

    <div v-else-if="orders.length === 0" class="alert alert-info text-center">
      Hiện chưa có đơn hàng nào.
    </div>

    <div v-else class="table-responsive">
      <table class="table table-bordered align-middle text-center">
        <thead class="table-light">
          <tr>
            <th>Mã Đơn</th>
            <th>Người Mua</th>
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
            <td>{{ order.user || "—" }}</td>
            <td>{{ formatPrice(order.totalPrice) }}</td>
            <td>{{ order.paymentMethod }}</td>
            <td>
              <select
                v-model="order.status"
                class="form-select form-select-sm"
                @change="updateStatus(order)"
              >
                <option value="Chờ xử lý">Chờ xử lý</option>
                <option value="Đang giao">Đang giao</option>
                <option value="Hoàn thành">Hoàn thành</option>
                <option value="Đã hủy">Đã hủy</option>
              </select>
            </td>
            <td>{{ new Date(order.createdAt).toLocaleString() }}</td>
            <td>
              <button class="btn btn-outline-primary btn-sm" @click="viewDetail(order)">
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
import { useRouter } from "vue-router";
import { useOrderStore } from "@/store/order";

const router = useRouter();
const orderStore = useOrderStore();
const { orders } = orderStore;

onMounted(async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "admin") {
    alert("🚫 Bạn không có quyền truy cập trang quản trị!");
    router.push("/");
  } else {
    await orderStore.fetchAllOrders();
  }
});

function updateStatus(order) {
  if (confirm(`Bạn có chắc muốn đổi trạng thái đơn hàng #${order.id || order._id} thành "${order.status}" không?`)) {
    orderStore.updateStatus(order.id || order._id, order.status);
  }
}

function viewDetail(order) {
  const detail = order.cart?.map((item) => `• ${item.name} × ${item.quantity}`).join("\n");
  alert(`📄 Chi tiết đơn hàng #${order.orderCode}\n${detail}\n\nTrạng thái: ${order.status}`);
}

function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN").format(value) + "₫";
}
</script>
