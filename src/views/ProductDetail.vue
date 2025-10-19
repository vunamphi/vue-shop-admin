<template>
  <div class="container py-5">
    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="alert alert-danger text-center">
      {{ error }}
    </div>

    <!-- Nội dung sản phẩm -->
    <div v-else-if="product" class="row g-5">
      <!-- Ảnh sản phẩm -->
      <div class="col-md-6">
        <img :src="selectedImage || 'https://via.placeholder.com/400'" class="img-fluid rounded border mb-3"
          alt="product" />
        <div class="d-flex gap-2">
          <img v-for="(img, i) in product.images" :key="i" :src="img" class="img-thumbnail" width="80" height="80"
            @click="selectedImage = img" :class="{ 'border-primary border-3': selectedImage === img }" />
        </div>
      </div>

      <!-- Thông tin sản phẩm -->
      <div class="col-md-6">
        <div class="d-flex justify-content-between align-items-center">
          <h2 class="fw-bold">{{ product.name }}</h2>
          <button class="btn d-flex align-items-center gap-2" @click="toggleFavorite"
            :class="isFavorite ? 'btn-danger text-white' : 'btn-outline-danger'">
            <i class="bi" :class="isFavorite ? 'bi-heart-fill' : 'bi-heart'"></i>
            <span>{{ isFavorite ? "Đã thích" : "Thích" }}</span>
          </button>
        </div>

        <p class="text-muted">{{ product.description }}</p>
        <h4 class="text-danger">{{ formatPrice(product.price) }}</h4>

        <p class="text-muted">
          <strong>Tồn kho:</strong> {{ product.stock || 0 }}
        </p>

        <div class="d-flex align-items-center my-3 gap-2">
          <button class="btn btn-outline-secondary" @click="decreaseQuantity">−</button>
          <input type="number" v-model.number="quantity" min="1" class="form-control text-center" style="width: 70px" />
          <button class="btn btn-outline-secondary" @click="increaseQuantity">+</button>
        </div>

        <button class="btn btn-success px-4" @click="addToCart" :disabled="product.stock <= 0">
          <i class="bi bi-cart-plus"></i>
          {{ product.stock > 0 ? "Thêm vào giỏ hàng" : "Hết hàng" }}
        </button>
      </div>
    </div>

    <!-- ============================= -->
    <!-- 🔥 Sản phẩm bán chạy -->
    <!-- ============================= -->
    <div v-if="bestSellingProducts.length" class="mt-5">
      <h4 class="fw-bold mb-4">🔥 Sản phẩm bán chạy</h4>

      <div class="row g-4">
        <div v-for="item in bestSellingProducts" :key="item.id" class="col-md-4">
          <div class="card h-100 shadow-sm border-0 hover-scale" @click="goToProduct(item.id)" style="cursor: pointer">
            <img :src="item.images?.[0] || 'https://via.placeholder.com/300'" class="card-img-top" alt="..."
              height="200" style="object-fit: cover" />
            <div class="card-body">
              <h6 class="fw-semibold">{{ item.name }}</h6>
              <p class="text-danger mb-0">{{ formatPrice(item.price) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================= -->
    <!-- 🧩 Sản phẩm tương tự -->
    <!-- ============================= -->
    <div v-if="similarProducts.length" class="mt-5">
      <h4 class="fw-bold mb-4">🧩 Sản phẩm tương tự</h4>

      <div class="row g-4">
        <div v-for="item in similarProducts" :key="item.id" class="col-md-4">
          <div class="card h-100 shadow-sm border-0 hover-scale" @click="goToProduct(item.id)" style="cursor: pointer">
            <img :src="item.images?.[0] || 'https://via.placeholder.com/300'" class="card-img-top" alt="..."
              height="200" style="object-fit: cover" />
            <div class="card-body">
              <h6 class="fw-semibold">{{ item.name }}</h6>
              <p class="text-danger mb-0">{{ formatPrice(item.price) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 💬 Bình luận sản phẩm -->
    <hr class="my-5" />
    <ProductComments />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { useCartStore } from "@/store/cart";
import ProductComments from "@/components/ProductComments.vue";

const route = useRoute(); 
const router = useRouter();
const cartStore = useCartStore();

const product = ref(null);
const bestSellingProducts = ref([]);
const similarProducts = ref([]);
const selectedImage = ref(null);
const loading = ref(true);
const error = ref(null);
const quantity = ref(1);
const isFavorite = ref(false);

onMounted(() => {
  loadProduct();
  loadFavorites();
});

watch(
  () => route.params.id,
  () => loadProduct()
);

async function loadProduct() {
  loading.value = true;
  error.value = null;
  try {
    const id = route.params.id;
    const res = await axios.get("http://localhost:3000/products");
    const found = res.data.find((p) => String(p.id) === String(id));

    if (!found) {
      error.value = "Không tìm thấy sản phẩm!";
      setTimeout(() => router.push("/shop"), 2000);
    } else {
      product.value = found;
      selectedImage.value = found.images?.[0] || "";

      // Yêu thích
      const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
      isFavorite.value = favs.includes(found.id);

      // Sản phẩm bán chạy (top 3 theo giá cao)
      bestSellingProducts.value = res.data
        .filter((p) => p.id !== found.id)
        .sort((a, b) => b.price - a.price)
        .slice(0, 3);

      // Sản phẩm tương tự (cùng category)
      similarProducts.value = res.data
        .filter((p) => p.id !== found.id && p.category_id === found.category_id)
        .slice(0, 3);
    }
  } catch (err) {
    console.error(err);
    error.value = "Không thể tải thông tin sản phẩm!";
  } finally {
    loading.value = false;
  }
}

// 🛒 Thêm vào giỏ hàng
function addToCart() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    if (confirm("⚠️ Bạn cần đăng nhập để mua hàng. Chuyển đến trang đăng nhập?"))
      router.push("/login");
    return;
  }
  if (product.value.stock <= 0) {
    alert("❌ Sản phẩm đã hết hàng!");
    return;
  }

  cartStore.addToCart(product.value, quantity.value);
  alert(`✅ Đã thêm ${quantity.value} sản phẩm vào giỏ hàng!`);
}

// ❤️ Yêu thích
function toggleFavorite() {
  const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  if (isFavorite.value) {
    const index = favs.indexOf(product.value.id);
    if (index > -1) favs.splice(index, 1);
  } else {
    favs.push(product.value.id);
  }
  localStorage.setItem("favorites", JSON.stringify(favs));
  isFavorite.value = !isFavorite.value;
}

function loadFavorites() {
  const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  isFavorite.value = favs.includes(Number(route.params.id));
}

// Tăng giảm SL
function increaseQuantity() {
  if (quantity.value < (product.value.stock || 0)) quantity.value++;
}
function decreaseQuantity() {
  if (quantity.value > 1) quantity.value--;
}

function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}

function goToProduct(id) {
  router.push(`/product/${id}`);
}
</script>
