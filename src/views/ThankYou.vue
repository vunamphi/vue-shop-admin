<template>
  <div class="container py-5 text-center">
    <div class="card shadow p-5 border-0">
      <h1 class="fw-bold text-success mb-3">🎉 Cảm ơn bạn đã mua hàng!</h1>
      <p class="lead">Đơn hàng của bạn đã được ghi nhận thành công.</p>

      <div v-if="order" class="mt-4">
        <h5>🧾 Mã đơn hàng: <strong>{{ order.orderCode }}</strong></h5>
        <p>Tổng tiền: <span class="text-danger fw-bold">{{ formatPrice(order.totalPrice) }}</span></p>
        <p>Phương thức thanh toán: {{ formatMethod(order.paymentMethod) }}</p>
        <p>Thời gian đặt: {{ order.createdAt }}</p>
      </div>

      <router-link to="/shop" class="btn btn-primary mt-4 px-4">
        🛍️ Tiếp tục mua sắm
      </router-link>
    </div>

    <!-- Gợi ý sản phẩm -->
    <div v-if="relatedProducts.length" class="mt-5">
      <h4 class="fw-bold mb-4 text-start">Gợi ý cho bạn</h4>
      <div class="row g-4">
        <div v-for="item in relatedProducts" :key="item.id" class="col-md-4">
          <div class="card h-100 border-0 shadow-sm hover-scale" @click="goToProduct(item.id)" style="cursor:pointer">
            <img
              :src="item.images?.[0] || 'https://via.placeholder.com/300'"
              class="card-img-top"
              alt=""
              height="200"
              style="object-fit: cover"
            />
            <div class="card-body">
              <h6 class="fw-semibold">{{ item.name }}</h6>
              <p class="text-danger mb-0">{{ formatPrice(item.price) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const order = ref(JSON.parse(localStorage.getItem("lastOrder")) || null);
const relatedProducts = ref([]);
const router = useRouter();

onMounted(() => {
  loadRelatedProducts();
});

async function loadRelatedProducts() {
  try {
    const res = await axios.get("http://localhost:3000/products");
    relatedProducts.value = res.data.sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 3);
  } catch (err) {
    console.error("Lỗi tải sản phẩm gợi ý:", err);
  }
}

function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}
function formatMethod(method) {
  return method === "vnpay" ? "Thanh toán qua VNPay" : "Thanh toán khi nhận hàng (COD)";
}
function goToProduct(id) {
  router.push(`/product/${id}`);
}
</script>

<style scoped>
.hover-scale {
  transition: 0.2s;
}
.hover-scale:hover {
  transform: scale(1.03);
}
</style>
