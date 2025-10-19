<template>
  <div
    class="d-flex flex-column flex-shrink-0 p-3 bg-white border-end vh-100"
    style="width: 250px;"
  >
    <a href="/" class="d-flex align-items-center mb-3 text-decoration-none">
      <span class="fs-5 fw-semibold">🛍️ Admin Panel</span>
    </a>
    <hr />
    <ul class="nav nav-pills flex-column mb-auto">
      <li class="nav-item">
        <router-link to="/dashboard/products" class="nav-link" active-class="active">
          <i class="bi bi-box"></i> Products
        </router-link>
      </li>

      <li>
        <router-link to="/dashboard/categories" class="nav-link" active-class="active">
          <i class="bi bi-tags"></i> Categories
        </router-link>
      </li>

      <!-- ✅ Thêm menu Quản lý đơn hàng -->
      <li v-if="isAdmin">
        <router-link to="/dashboard/orders" class="nav-link" active-class="active">
          <i class="bi bi-receipt"></i> Orders
        </router-link>
      </li>

      <li v-if="isAdmin">
        <router-link to="/dashboard/users" class="nav-link" active-class="active">
          <i class="bi bi-people"></i> Users
        </router-link>
      </li>
    </ul>
    <hr />
    <button class="btn btn-outline-secondary w-100" @click="logout">🚪 Logout</button>
  </div>
</template>

<script setup>
import { useAuthStore } from "../store/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();
const isAdmin = auth.user?.role === "admin";

function logout() {
  auth.logout();
  router.push("/login");
}
</script>

<style scoped>
.nav-link {
  color: #333;
  margin-bottom: 4px;
}
.nav-link.active {
  background-color: #0d6efd;
  color: #fff !important;
}
</style>
