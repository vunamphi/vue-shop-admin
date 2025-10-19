<template>
  <div class="container mt-4">
    <h2>Quản lý sản phẩm</h2>

    <button class="btn btn-primary mb-3" @click="addProduct">+ Thêm sản phẩm</button>

    <table class="table table-striped align-middle">
      <thead>
        <tr>
          <th>Tên</th>
          <th>Giá</th>
          <th>Giảm giá</th>
          <th>Số lượng</th>
          <th>Danh mục</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in products" :key="p.id">
          <td>{{ p.name }}</td>
          <td>{{ formatPrice(p.price) }}</td>
          <td>{{ p.discount || 0 }}%</td>
          <td>{{ p.quantity || 0 }}</td>
          <td>{{ findCategory(p.category_id) }}</td>
          <td>
            <button class="btn btn-warning btn-sm" @click="editProduct(p)">Sửa</button>
            <button class="btn btn-danger btn-sm" @click="deleteProduct(p.id)">Xóa</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal thêm / sửa -->
    <div v-if="editing" class="modal d-block bg-dark bg-opacity-50">
      <div class="modal-dialog modal-lg">
        <div class="modal-content p-4">
          <h5>{{ current.id ? 'Sửa' : 'Thêm' }} sản phẩm</h5>
          <input v-model="current.name" placeholder="Tên sản phẩm" class="form-control mb-2" />
          <input v-model.number="current.price" placeholder="Giá" class="form-control mb-2" type="number" />
          <input v-model.number="current.discount" placeholder="Giảm giá (%)" class="form-control mb-2" type="number" />
          <input v-model.number="current.quantity" placeholder="Số lượng" class="form-control mb-2" type="number" />
          <select v-model.number="current.category_id" class="form-select mb-2">
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
          <input v-model="imageUrls" placeholder="Nhập link hình (phân tách bằng dấu phẩy)" class="form-control mb-2" />
          <div class="text-end">
            <button class="btn btn-secondary me-2" @click="cancel">Hủy</button>
            <button class="btn btn-success" @click="saveProduct">Lưu</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";

const products = ref([]);
const categories = ref([]);
const editing = ref(false);
const current = ref({});
const imageUrls = ref("");

onMounted(async () => {
  const [resP, resC] = await Promise.all([
    axios.get("http://localhost:3000/products"),
    axios.get("http://localhost:3000/categories")
  ]);
  products.value = resP.data;
  categories.value = resC.data;
});

const formatPrice = (v) => new Intl.NumberFormat("vi-VN").format(v) + "₫";
const findCategory = (id) => categories.value.find((c) => c.id === id)?.name || "-";

const addProduct = () => {
  current.value = { name: "", price: 0, discount: 0, quantity: 0, category_id: 1, images: [] };
  imageUrls.value = "";
  editing.value = true;
};

const editProduct = (p) => {
  current.value = { ...p };
  imageUrls.value = p.images?.join(",") || "";
  editing.value = true;
};

const cancel = () => (editing.value = false);

const saveProduct = async () => {
  current.value.images = imageUrls.value.split(",").map((i) => i.trim());
  if (current.value.id) {
    await axios.put(`http://localhost:3000/products/${current.value.id}`, current.value);
  } else {
    await axios.post("http://localhost:3000/products", current.value);
  }
  const res = await axios.get("http://localhost:3000/products");
  products.value = res.data;
  editing.value = false;
};

const deleteProduct = async (id) => {
  if (confirm("Xóa sản phẩm này?")) {
    await axios.delete(`http://localhost:3000/products/${id}`);
    products.value = products.value.filter((p) => p.id !== id);
  }
};
</script>

<style scoped>
.modal-content {
  border-radius: 10px;
}
</style>
