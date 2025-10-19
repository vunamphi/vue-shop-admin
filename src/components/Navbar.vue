<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
    <div class="container">
      <router-link class="navbar-brand fw-bold text-primary" to="/shop">
        🛍️ Cửa Hàng Điện Thoại
      </router-link>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto align-items-center">
          <li class="nav-item">
            <router-link class="nav-link" to="/shop">Cửa hàng</router-link>
          </li>

          <li v-if="isAdmin" class="nav-item">
            <router-link to="/dashboard/products" class="nav-link">Quản trị</router-link>
          </li>

          <template v-if="!isAuthenticated">
            <li class="nav-item">
              <router-link class="nav-link" to="/login">Đăng nhập</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/register">Đăng ký</router-link>
            </li>
          </template>

          <template v-else>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown">
                👤 <span class="ms-1">{{ currentUser?.username }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <router-link to="/profile" class="dropdown-item">📄 Hồ sơ của tôi</router-link>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <button class="dropdown-item text-danger" @click="logout">🚪 Đăng xuất</button>
                </li>
              </ul>
            </li>
          </template>

          <!-- Favorites -->
          <li class="nav-item ms-3 position-relative">
            <router-link class="nav-link" to="/favorites">
              ❤️
              <span v-if="favoritesCount > 0" class="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">
                {{ favoritesCount }}
              </span>
            </router-link>
          </li>

          <!-- Cart -->
          <li class="nav-item ms-3 position-relative">
            <router-link class="nav-link cart-link" to="/cart">
              🛒
              <span v-if="cartCount > 0" class="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">
                {{ cartCount }}
              </span>
            </router-link>
          </li>
        </ul>
      </div>
    </div>

    <!-- Bộ lọc sản phẩm chỉ hiển thị ở /shop -->
    <div class="filter-bar bg-white shadow-sm border-top py-2" v-if="$route.path === '/shop'">
      <div class="container">
        <div class="row g-2 align-items-center">
          <!-- Danh mục -->
          <div class="col-md-3">
            <select v-model="selectedCategory" class="form-select form-select-sm" @change="emitFilter">
              <option value="all">Tất cả danh mục</option>
              <option v-for="cat in categories" :key="cat.id" :value="String(cat.id).trim()">{{ cat.name }}</option>
            </select>
          </div>

          <!-- Lọc giá -->
          <div class="col-md-3">
            <select v-model="priceFilter" class="form-select form-select-sm" @change="emitFilter">
              <option value="">Tất cả giá</option>
              <option value="low-high">Giá thấp → cao</option>
              <option value="high-low">Giá cao → thấp</option>
              <option value="under-5m">Dưới 5 triệu</option>
              <option value="5-10m">5 - 10 triệu</option>
              <option value="above-10m">Trên 10 triệu</option>
            </select>
          </div>

          <!-- Tìm kiếm -->
          <div class="col-md-6">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-light border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input v-model="searchTerm" type="text" class="form-control border-start-0" placeholder="Tìm sản phẩm..." @input="emitFilter" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { storeToRefs } from "pinia";
import api from "@/api/api";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const { currentUser, isAuthenticated, isAdmin } = storeToRefs(auth);

const cartCount = ref(0);
const favoritesCount = ref(0);

// Bộ lọc sản phẩm
const categories = ref([]);
const selectedCategory = ref("all");
const priceFilter = ref("");
const searchTerm = ref("");

const emitFilter = () => {
  window.dispatchEvent(new CustomEvent("filter-updated", {
    detail: {
      category: selectedCategory.value,
      price: priceFilter.value,
      search: searchTerm.value
    }
  }));
};

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cartCount.value = cart.length;
}

function updateFavoritesCount() {
  const favs = JSON.parse(localStorage.getItem("favorites")) || [];
  favoritesCount.value = favs.length;
}

onMounted(async () => {
  // Load categories
  try {
    const { data } = await api.get("/categories");
    categories.value = data.map(c => ({ ...c, id: String(c.id).trim() }));
  } catch (err) {
    console.error("Lỗi tải danh mục:", err);
  }

  updateCartCount();
  updateFavoritesCount();

  window.addEventListener("cart-updated", updateCartCount);
  window.addEventListener("favorites-updated", updateFavoritesCount);
});

// Reset filter khi đổi route
watch(() => route.path, (newPath) => {
  if (newPath !== "/shop") {
    selectedCategory.value = "all";
    priceFilter.value = "";
    searchTerm.value = "";
  }
});

// Logout
const logout = () => {
  auth.logout();
  router.push("/login");
};
</script>

<style scoped>
.navbar { position: sticky; top:0; z-index:1050; backdrop-filter: blur(8px); }
.navbar-brand { font-size:1.3rem; font-weight:700; color:#0d6efd !important; }
.navbar-nav .nav-link { font-weight:500; color:#555 !important; border-radius:8px; padding:6px 12px; }
.navbar-nav .nav-link:hover { color:#0d6efd !important; background:rgba(13,110,253,0.1); transform:translateY(-1px); }
.cart-link { font-size:1.5rem; color:#444 !important; }
.badge { box-shadow:0 0 8px rgba(255,0,0,0.4); }
.filter-bar { position: sticky; top:70px; z-index:1040; background:#fff; border-top:1px solid #eee; border-bottom:1px solid #eee; box-shadow:0 2px 10px rgba(0,0,0,0.04); padding:0.75rem 0; }
.filter-bar select, .filter-bar input { border-radius:12px; border:1px solid #ddd; font-size:0.9rem; }
</style>
