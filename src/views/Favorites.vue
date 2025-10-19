<template>
  <div class="container py-5">
    <h2 class="mb-4">❤️ Sản phẩm yêu thích của bạn</h2>

    <div v-if="favorites.length === 0" class="text-center text-muted">
      Bạn chưa có sản phẩm nào trong mục yêu thích.
    </div>

    <div v-else class="row g-4">
      <div v-for="item in favorites" :key="item.id" class="col-md-4">
        <div class="card h-100 shadow-sm border-0 hover-scale" @click="goToProduct(item.id)" style="cursor:pointer">
          <img :src="item.images?.[0] || 'https://via.placeholder.com/300'" class="card-img-top" alt="..." height="200" style="object-fit:cover" />
          <div class="card-body">
            <h6 class="fw-semibold">{{ item.name }}</h6>
            <p class="text-danger mb-0">{{ formatPrice(item.price) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const favorites = ref([]);

onMounted(async () => {
  const favIds = JSON.parse(localStorage.getItem("favorites") || "[]");
  if (favIds.length === 0) return;

  const res = await axios.get("http://localhost:3000/products");
  favorites.value = res.data.filter(p => favIds.includes(p.id));
});

function goToProduct(id) {
  router.push(`/product/${id}`);
}

function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}
</script>
