<template>
  <div class="container py-5" style="max-width: 600px;">
    <div class="card shadow-sm p-4">
      <h3 class="text-center mb-3">👤 Hồ Sơ Của Tôi</h3>

      <form @submit.prevent="updateProfile">
        <div class="mb-3">
          <label class="form-label">Tên đăng nhập</label>
          <input v-model="form.username" class="form-control" disabled />
        </div>

        <div class="mb-3">
          <label class="form-label">Email</label>
          <input v-model="form.email" class="form-control" type="email" />
        </div>

        <div class="mb-3">
          <label class="form-label">Tuổi</label>
          <input v-model="form.age" class="form-control" type="number" />
        </div>

        <div class="mb-3">
          <label class="form-label">Giới tính</label>
          <select v-model="form.gender" class="form-select">
            <option>Nam</option>
            <option>Nữ</option>
            <option>Khác</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">Sản phẩm mong muốn</label>
          <div class="d-flex flex-wrap gap-2">
            <div v-for="item in options" :key="item" class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                :value="item"
                v-model="form.desiredProducts"
              />
              <label class="form-check-label">{{ item }}</label>
            </div>
          </div>
        </div>

        <button class="btn btn-success w-100">Lưu thay đổi</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { useAuthStore } from "@/store/auth";

const auth = useAuthStore();
const options = [
  "Điện thoại",
  "Laptop",
  "Máy tính bảng",
  "Phụ kiện",,
  "Đồng hồ thông minh",
];

const form = reactive({ ...auth.currentUser });

async function updateProfile() {
  await auth.updateUser(form);
  alert("✅ Cập nhật thông tin thành công!");
}
</script>
