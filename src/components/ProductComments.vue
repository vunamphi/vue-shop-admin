<template>
  <div class="mt-5">
    <h4 class="fw-bold mb-3">💬 Bình luận sản phẩm</h4>

    <!-- Form bình luận -->
    <div v-if="user" class="card p-3 mb-4 shadow-sm border-0">
      <div class="mb-2 fw-semibold">Xin chào, {{ user.username }} 👋</div>

      <textarea
        v-model="newComment"
        rows="3"
        class="form-control mb-3"
        placeholder="Viết bình luận của bạn..."
      ></textarea>

      <div class="d-flex align-items-center justify-content-between">
        <div>
          <label class="fw-semibold me-2">Đánh giá:</label>
          <i
            v-for="n in 5"
            :key="n"
            class="bi"
            :class="n <= rating ? 'bi-star-fill text-warning' : 'bi-star text-secondary'"
            style="cursor:pointer;font-size:1.3rem"
            @click="rating = n"
          ></i>
        </div>

        <button class="btn btn-primary" @click="submitComment">Gửi bình luận</button>
      </div>
    </div>

    <div v-else class="alert alert-info text-center">
      🧍‍♂️ Vui lòng <router-link to="/login">đăng nhập</router-link> để bình luận.
    </div>

    <!-- Danh sách bình luận -->
    <div v-if="comments.length" class="mt-4">
      <div
        v-for="(cmt, i) in comments"
        :key="i"
        class="card mb-3 border-0 shadow-sm"
      >
        <div class="card-body">
          <div class="d-flex align-items-center mb-2">
            <img
              :src="cmt.avatar || 'https://i.pravatar.cc/40?img=' + (i + 3)"
              alt="avatar"
              class="rounded-circle me-3"
              width="40"
              height="40"
            />
            <div>
              <strong>{{ cmt.username }}</strong>
              <br />
              <small class="text-muted">{{ formatDate(cmt.date) }}</small>
            </div>
          </div>

          <div class="mb-2">
            <i
              v-for="n in 5"
              :key="n"
              class="bi"
              :class="n <= cmt.rating ? 'bi-star-fill text-warning' : 'bi-star text-secondary'"
            ></i>
          </div>

          <p class="mb-0">{{ cmt.text }}</p>
        </div>
      </div>
    </div>

    <div v-else class="text-muted fst-italic">
      Chưa có bình luận nào cho sản phẩm này.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const comments = ref([]);
const newComment = ref("");
const rating = ref(0);
const user = ref(JSON.parse(localStorage.getItem("user")) || null);

// Load khi mount
onMounted(() => {
  loadComments();
});

watch(
  () => route.params.id,
  () => loadComments()
);

function loadComments() {
  const all = JSON.parse(localStorage.getItem("productComments") || "{}");
  comments.value = all[route.params.id] || [];
}

function submitComment() {
  if (!newComment.value.trim()) {
    alert("❌ Vui lòng nhập nội dung bình luận!");
    return;
  }

  const cmt = {
    username: user.value.username,
    avatar: user.value.avatar || "",
    text: newComment.value.trim(),
    rating: rating.value,
    date: new Date().toISOString(),
  };

  const all = JSON.parse(localStorage.getItem("productComments") || "{}");
  if (!all[route.params.id]) all[route.params.id] = [];
  all[route.params.id].push(cmt);

  localStorage.setItem("productComments", JSON.stringify(all));
  comments.value = all[route.params.id];
  newComment.value = "";
  rating.value = 0;

  alert("🎉 Cảm ơn bạn đã bình luận!");
}

function formatDate(date) {
  return new Date(date).toLocaleString("vi-VN");
}
</script>

<style scoped>
textarea {
  resize: none;
}
.bi {
  transition: 0.2s;
}
.bi:hover {
  transform: scale(1.2);
}
</style>
