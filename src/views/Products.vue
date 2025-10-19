<template>
  <div class="admin-wrapper">
    <div class="container-fluid content-area">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="mb-0 text-white">📦 Quản lý sản phẩm</h4>
        <button class="btn btn-success shadow" @click="openForm()">➕ Thêm mới</button>
      </div>

      <!-- 🔍 Tìm kiếm + Sắp xếp -->
      <div class="row mb-3">
        <div class="col-md-4">
          <input v-model="search" @input="fetchProducts" class="form-control" placeholder="🔍 Tìm kiếm sản phẩm..." />
        </div>
        <div class="col-md-3">
          <select v-model="sort" @change="fetchProducts" class="form-select">
            <option value="category_id">Sắp xếp theo Danh mục</option>
            <option value="price">Sắp xếp theo Giá</option>
          </select>
        </div>
      </div>

      <!-- 🧾 Danh sách sản phẩm -->
      <div class="card shadow-lg">
        <div class="card-body p-0 bg-light rounded-3">
          <table class="table table-hover table-striped mb-0 align-middle">
            <thead class="table-primary">
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Đã bán</th>
                <th>Ảnh</th>
                <th class="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in products" :key="p.id">
                <td>{{ p.id }}</td>
                <td>{{ p.name }}</td>
                <td>{{ getCategoryName(p.category_id) }}</td>
                <td>{{ formatPrice(p.price) }}</td>
                <td :class="{ 'text-danger fw-bold': p.stock === 0 }">{{ p.stock }}</td>
                <td>{{ p.sold || 0 }}</td>
                <td>
                  <img :src="p.images?.[0]" width="70" height="70" class="rounded shadow-sm object-fit-cover" alt="product" />
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-warning me-2" @click="openForm(p)">✏️</button>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteProduct(p.id)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal -->
      <div v-if="showModal" class="modal fade show d-block" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-lg">
          <div class="modal-content p-4">
            <h5 class="mb-3">{{ form.id ? "✏️ Sửa sản phẩm" : "➕ Thêm sản phẩm" }}</h5>

            <input v-model="form.name" class="form-control mb-3" placeholder="Tên sản phẩm" />
            <input v-model.number="form.price" type="number" class="form-control mb-3" placeholder="Giá (₫)" />
            <input v-model.number="form.stock" type="number" class="form-control mb-3" placeholder="Số lượng tồn" />

            <select v-model.number="form.category_id" class="form-select mb-3">
              <option disabled value="">Chọn danh mục</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>

            <textarea v-model="form.description" rows="3" class="form-control mb-3" placeholder="Giới thiệu sản phẩm..."></textarea>

            <!-- Ảnh -->
            <div class="mb-3">
              <label class="form-label fw-bold">Ảnh sản phẩm</label>
              <div class="d-flex gap-2 mb-2">
                <button class="btn btn-outline-primary btn-sm" @click="addLinkInput">🔗 Thêm link ảnh</button>
                <input type="file" multiple accept="image/*" class="form-control form-control-sm" @change="handleFiles" />
              </div>

              <div v-for="(link, i) in imageLinks" :key="i" class="input-group mb-2">
                <input v-model="imageLinks[i]" type="text" class="form-control" placeholder="Link ảnh..." />
                <button class="btn btn-outline-danger" type="button" @click="removeLink(i)">✖</button>
              </div>

              <div class="d-flex flex-wrap gap-2">
                <div v-for="(img, index) in imagePreviews" :key="index" class="position-relative" style="width: 100px">
                  <img :src="img" class="img-thumbnail" />
                  <button class="btn btn-sm btn-danger position-absolute top-0 end-0" @click="removeImage(index)">×</button>
                </div>
              </div>
            </div>

            <div class="text-end mt-3">
              <button class="btn btn-secondary me-2" @click="closeForm">Hủy</button>
              <button class="btn btn-success" @click="saveProduct">{{ form.id ? "Cập nhật" : "Lưu" }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import api from "../api/api";
import { ref, onMounted } from "vue";

const products = ref([]);
const categories = ref([]);
const search = ref("");
const sort = ref("category_id");
const showModal = ref(false);
const form = ref({});
const imagePreviews = ref([]);
const imageLinks = ref([]);

async function fetchProducts() {
  const { data } = await api.get(`/products?q=${search.value}&_sort=${sort.value}&_order=asc`);
  products.value = data;
}
async function fetchCategories() {
  const { data } = await api.get("/categories");
  categories.value = data;
}
function getCategoryName(id) {
  return categories.value.find((c) => c.id === id)?.name || "—";
}
function formatPrice(v) {
  return new Intl.NumberFormat("vi-VN").format(v) + "₫";
}
async function deleteProduct(id) {
  if (confirm("Bạn có chắc muốn xóa sản phẩm này không?")) {
    await api.delete(`/products/${id}`);
    fetchProducts();
  }
}
function openForm(p = null) {
  form.value = p
    ? JSON.parse(JSON.stringify(p))
    : { name: "", price: "", stock: 0, category_id: "", description: "", images: [] };
  imagePreviews.value = form.value.images || [];
  imageLinks.value = [];
  showModal.value = true;
}
function closeForm() {
  showModal.value = false;
  form.value = {};
  imagePreviews.value = [];
  imageLinks.value = [];
}
function handleFiles(e) {
  const files = Array.from(e.target.files);
  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      imagePreviews.value.push(event.target.result);
    };
    reader.readAsDataURL(file);
  });
}
function addLinkInput() {
  imageLinks.value.push("");
}
function removeLink(i) {
  imageLinks.value.splice(i, 1);
}
function removeImage(i) {
  imagePreviews.value.splice(i, 1);
}
async function saveProduct() {
  const allImages = [...imagePreviews.value, ...imageLinks.value.filter((l) => l)];
  form.value.images = allImages;
  if (!form.value.name || !form.value.category_id || !form.value.price) {
    alert("⚠️ Vui lòng nhập đầy đủ thông tin!");
    return;
  }
  if (form.value.id) {
    await api.put(`/products/${form.value.id}`, form.value);
    alert("✅ Cập nhật thành công!");
  } else {
    form.value.sold = 0;
    await api.post("/products", form.value);
    alert("✅ Thêm mới thành công!");
  }
  closeForm();
  fetchProducts();
}
onMounted(() => {
  fetchCategories();
  fetchProducts();
});
</script>

<style scoped>
.admin-wrapper {
  background: url("https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1600&q=80")
    center/cover no-repeat;
  min-height: 100vh;
  padding: 40px 0;
  position: relative;
}
.admin-wrapper::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}
.content-area {
  position: relative;
  z-index: 2;
}
.img-thumbnail {
  width: 100px;
  height: 100px;
  object-fit: cover;
}
.modal {
  display: block;
}
</style>
