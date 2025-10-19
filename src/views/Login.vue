<template>
  <div class="d-flex justify-content-center align-items-center vh-100">
    <div class="card p-4" style="width: 350px;">
      <h4 class="text-center mb-3">Đăng nhập</h4>
      <form @submit.prevent="handleLogin">
        <input v-model="username" class="form-control mb-2" placeholder="Tên đăng nhập" />
        <input v-model="password" class="form-control mb-3" type="password" placeholder="Mật khẩu" />
        <button class="btn btn-primary w-100">Đăng nhập</button>
        <p class="text-danger mt-2">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "@/store/auth";
import { useRouter } from "vue-router";
import { ref } from "vue";

const auth = useAuthStore();
const router = useRouter();

const username = ref("");
const password = ref("");
const error = ref("");

async function handleLogin() {
  try {
    const user = await auth.login(username.value, password.value);

    if (!user.hasCompletedTest && user.role === "user") {
      router.push("/test");
    } else if (user.role === "admin") {
      router.push("/dashboard");
    } else {
      router.push("/shop");
    }
  } catch (err) {
    error.value = err.message;
  }
}
</script>
