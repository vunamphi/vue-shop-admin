<template>
  <div class="container mt-4">
    <h2 class="fw-bold mb-3">👥 Quản lý người dùng</h2>

    <div v-if="users.length === 0" class="text-center py-4">
      <p>Không có tài khoản nào.</p>
    </div>

    <div v-else>
      <table class="table table-bordered align-middle text-center">
        <thead class="table-light">
          <tr>
            <th>ID</th>
            <th>Tên đăng nhập</th>
            <th>Quyền</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.id }}</td>
            <td>{{ u.username }}</td>
            <td>
              <select
                v-model="u.role"
                class="form-select form-select-sm"
                @change="updateRole(u)"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </td>
            <td>
              <button
                class="btn btn-danger btn-sm"
                @click="deleteUser(u.id)"
              >
                Xóa
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const users = ref([]);

onMounted(async () => {
  try {
    const res = await axios.get("http://localhost:3000/users");
    users.value = res.data;
  } catch (err) {
    console.error("Không thể tải danh sách users:", err);
    alert("Không thể kết nối JSON Server!");
  }
});

// 🧩 Cập nhật quyền người dùng
async function updateRole(user) {
  try {
    const id = user.id; // giữ nguyên kiểu id (có thể là số hoặc chuỗi)
    const res = await axios.patch(`http://localhost:3000/users/${id}`, {
      role: user.role,
    });

    // Cập nhật lại UI nếu server trả về thành công
    const index = users.value.findIndex((u) => u.id === id);
    if (index !== -1) {
      users.value[index].role = res.data.role;
    }

    alert(`✅ Đã cập nhật quyền của ${user.username} thành "${user.role}"`);
  } catch (err) {
    console.error("Lỗi khi cập nhật quyền:", err);

    if (err.response?.status === 404) {
      alert("❌ Không tìm thấy người dùng trong cơ sở dữ liệu!");
    } else {
      alert("❌ Lỗi máy chủ khi cập nhật quyền!");
    }
  }
}

// 🗑️ Xóa người dùng
async function deleteUser(id) {
  if (!confirm("Bạn có chắc muốn xóa tài khoản này không?")) return;

  try {
    await axios.delete(`http://localhost:3000/users/${id}`);
    users.value = users.value.filter((u) => u.id !== id);
    alert("✅ Đã xóa người dùng!");
  } catch (err) {
    console.error("Lỗi khi xóa user:", err);
    alert("❌ Không thể xóa người dùng này!");
  }
}
</script>

<style scoped>
table {
  border-radius: 8px;
  overflow: hidden;
}
select {
  width: 120px;
}
</style>
