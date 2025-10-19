<template>
  <div class="container mt-4">
    <h2>Quản lý danh mục</h2>

    <div class="d-flex mb-3">
      <input v-model="newCategory" placeholder="Tên danh mục mới" class="form-control me-2" />
      <button class="btn btn-success" @click="addCategory">Thêm</button>
    </div>

    <table class="table table-striped">
      <thead>
        <tr><th>Tên danh mục</th><th>Hành động</th></tr>
      </thead>
      <tbody>
        <tr v-for="c in categories" :key="c.id">
          <td>
            <input v-model="c.name" class="form-control" />
          </td>
          <td>
            <button class="btn btn-primary btn-sm" @click="updateCategory(c)">Lưu</button>
            <button class="btn btn-danger btn-sm" @click="deleteCategory(c.id)">Xóa</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";

const categories = ref([]);
const newCategory = ref("");

onMounted(async () => {
  const res = await axios.get("http://localhost:3000/categories");
  categories.value = res.data;
});

const addCategory = async () => {
  if (!newCategory.value) return;
  await axios.post("http://localhost:3000/categories", { name: newCategory.value });
  const res = await axios.get("http://localhost:3000/categories");
  categories.value = res.data;
  newCategory.value = "";
};

const updateCategory = async (cat) => {
  await axios.put(`http://localhost:3000/categories/${cat.id}`, cat);
};

const deleteCategory = async (id) => {
  if (confirm("Xóa danh mục này?")) {
    await axios.delete(`http://localhost:3000/categories/${id}`);
    categories.value = categories.value.filter((c) => c.id !== id);
  }
};
</script>
