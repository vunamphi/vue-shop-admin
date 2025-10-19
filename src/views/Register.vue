<template>
  <div class="container py-5" style="max-width: 500px;">
    <div class="card shadow-sm p-4">
      <h3 class="text-center mb-4 fw-bold">📝 Đăng ký tài khoản</h3>

      <form @submit.prevent="handleRegister">
        <div class="mb-3">
          <label class="form-label">Tên đăng nhập</label>
          <input v-model="username" type="text" class="form-control" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" class="form-control" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Tuổi</label>
          <input v-model="age" type="number" class="form-control" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Giới tính</label>
          <select v-model="gender" class="form-select" required>
            <option value="">-- Chọn giới tính --</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">Mật khẩu</label>
          <input v-model="password" type="password" class="form-control" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Xác nhận mật khẩu</label>
          <input v-model="confirmPassword" type="password" class="form-control" required />
        </div>

        <button class="btn btn-primary w-100 py-2 fw-semibold" type="submit">
          Đăng ký
        </button>

        <p class="text-center mt-3">
          Đã có tài khoản?
          <router-link to="/login">Đăng nhập</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import axios from "axios";

const router = useRouter();
const auth = useAuthStore();

const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const email = ref("");
const age = ref("");
const gender = ref("");

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    alert("❌ Mật khẩu xác nhận không khớp!");
    return;
  }

  const { data: users } = await axios.get("http://localhost:3000/users");
  if (users.find((u) => u.username === username.value.trim())) {
    alert("⚠️ Tên đăng nhập đã tồn tại!");
    return;
  }

  await auth.register(
    username.value.trim(),
    password.value,
    email.value,
    age.value,
    gender.value
  );

  alert("✅ Đăng ký thành công! Vui lòng đăng nhập để làm bài test.");
  router.push("/login");
};
</script>
