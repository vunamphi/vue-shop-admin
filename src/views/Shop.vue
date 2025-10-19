<template>
  <div class="shop-container py-4">
    <!-- Tiêu đề -->
    <h2 class="text-center mb-4 fw-bold text-primary">
      🛍️ Cửa Hàng Điện Thoại
    </h2>

    <!-- Danh sách sản phẩm -->
    <div class="row g-4">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="col-lg-3 col-md-4 col-sm-6"
      >
        <div class="card product-card border-0 shadow-sm h-100">
          <div class="product-img-wrapper">
            <img
              :src="
                product.images?.[0] ||
                'https://via.placeholder.com/300x300?text=No+Image'
              "
              class="card-img-top"
              alt="Product"
            />
          </div>
          <div class="card-body text-center">
            <h6 class="fw-semibold mb-1 text-dark text-truncate">
              {{ product.name }}
            </h6>
            <p class="text-secondary small mb-2">
              {{ getCategoryName(product.category_id) }}
            </p>
            <p class="text-danger fw-bold mb-3 fs-6">
              {{ formatPrice(product.price) }}
            </p>
            <router-link
              :to="`/product/${product.id}`"
              class="btn btn-outline-primary rounded-pill px-3 py-1"
            >
              Xem chi tiết
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Khi không có sản phẩm -->
    <div
      v-if="filteredProducts.length === 0"
      class="text-center mt-5 text-muted fs-5"
    >
      <i class="bi bi-emoji-frown"></i> Không tìm thấy sản phẩm phù hợp.
    </div>
  </div>
</template>

<script setup>
import api from "@/api/api";
import { ref, computed, onMounted } from "vue";

const products = ref([]);
const categories = ref([]);

// Các biến filter nhận từ Navbar
const selectedCategory = ref("");
const priceFilter = ref("");
const searchTerm = ref("");

// 🧩 Lọc sản phẩm
const filteredProducts = computed(() => {
  let result = [...products.value];

  // ✅ Lọc theo danh mục (so sánh id dạng chuỗi / số)
  if (selectedCategory.value && selectedCategory.value !== "all") {
    result = result.filter(
      (p) =>
        String(p.category_id).trim() === String(selectedCategory.value).trim()
    );
  }

  // ✅ Lọc theo giá
  switch (priceFilter.value) {
    case "low-high":
      result.sort((a, b) => a.price - b.price);
      break;
    case "high-low":
      result.sort((a, b) => b.price - a.price);
      break;
    case "under-5m":
      result = result.filter((p) => p.price < 5000000);
      break;
    case "5-10m":
      result = result.filter(
        (p) => p.price >= 5000000 && p.price <= 10000000
      );
      break;
    case "above-10m":
      result = result.filter((p) => p.price > 10000000);
      break;
  }

  // ✅ Lọc theo từ khóa
  if (searchTerm.value.trim() !== "") {
    result = result.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
  }

  return result;
});

// 🏷️ Lấy tên danh mục
function getCategoryName(id) {
  return (
    categories.value.find(
      (c) => String(c.id).trim() === String(id).trim()
    )?.name || "—"
  );
}

// 💰 Format giá
function formatPrice(v) {
  return new Intl.NumberFormat("vi-VN").format(v) + "₫";
}

// 📦 Lấy dữ liệu
async function fetchProducts() {
  const { data } = await api.get("/products");
  products.value = data;
}

async function fetchCategories() {
  const { data } = await api.get("/categories");
  categories.value = data;
}

// 📡 Nhận sự kiện lọc từ Navbar.vue
window.addEventListener("filter-updated", (e) => {
  selectedCategory.value = e.detail.category || "";
  priceFilter.value = e.detail.price || "";
  searchTerm.value = e.detail.search || "";
});

// 🚀 Khi load trang
onMounted(() => {
  fetchCategories();
  fetchProducts();
});
</script>

<style scoped>
.shop-container {
  background: #f5f6fa;
  min-height: 100vh;
}

.product-card {
  border-radius: 15px;
  overflow: hidden;
  background-color: #fff;
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.12);
}

.product-img-wrapper {
  background: #f9fafb;
  overflow: hidden;
  height: 230px;
  border-bottom: 1px solid #f0f0f0;
}

.product-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.4s ease;
}

.product-card:hover img {
  transform: scale(1.08);
}

.btn-outline-primary {
  font-size: 0.9rem;
  border-radius: 30px;
  transition: 0.3s ease;
}

.btn-outline-primary:hover {
  background-color: #0d6efd;
  color: #fff;
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
}

h2 {
  letter-spacing: 0.5px;
  text-shadow: 0 2px 3px rgba(13, 110, 253, 0.1);
}
</style>
