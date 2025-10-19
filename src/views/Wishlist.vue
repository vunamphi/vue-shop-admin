<template>
  <div class="container py-4">
    <h3 class="mb-4 text-center text-danger">💖 Sản phẩm ưa thích</h3>
    <div v-if="wishlist.length === 0" class="text-center text-muted">
      Chưa có sản phẩm nào được yêu thích.
    </div>

    <div class="row g-3">
      <div class="col-md-3" v-for="item in wishlist" :key="item.id">
        <div class="card h-100 shadow-sm">
          <img :src="item.image" class="card-img-top" />
          <div class="card-body text-center">
            <h6 class="fw-bold">{{ item.name }}</h6>
            <p class="text-primary mb-1">{{ item.price.toLocaleString() }} ₫</p>
            <router-link
              :to="'/product/' + item.id"
              class="btn btn-sm btn-outline-primary"
            >
              Xem chi tiết
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
const wishlist = ref([]);

onMounted(() => {
  wishlist.value = JSON.parse(localStorage.getItem("wishlist")) || [];
  window.addEventListener("wishlist-updated", () => {
    wishlist.value = JSON.parse(localStorage.getItem("wishlist")) || [];
  });
});
</script>
