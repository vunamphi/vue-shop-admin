<template>
  <div class="container py-5" style="max-width: 600px;">
    <div class="card shadow-sm p-4">
      <h4 class="text-center mb-3">🧩 Bài Test Chọn Sản Phẩm Mong Muốn</h4>
      <p class="text-muted text-center">Chọn các loại sản phẩm bạn quan tâm</p>

      <div class="d-flex flex-wrap gap-3 justify-content-center mb-3">
        <div v-for="item in options" :key="item" class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            :id="item"
            :value="item"
            v-model="selected"
          />
          <label class="form-check-label" :for="item">{{ item }}</label>
        </div>
      </div>

      <button class="btn btn-primary w-100" @click="submitTest">Hoàn tất</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const options = [
  "Điện thoại",
  "Laptop",
  "Máy tính bảng",
  "Phụ kiện",
  "Đồng hồ thông minh",
];

const selected = ref([]);

async function submitTest() {
  if (selected.value.length === 0) {
    alert("Vui lòng chọn ít nhất 1 sản phẩm mong muốn!");
    return;
  }

  await auth.updateUser({
    desiredProducts: selected.value,
    hasCompletedTest: true,
  });

  alert("✅ Cảm ơn bạn đã hoàn thành bài test!");
  router.push("/shop");
}
</script>
