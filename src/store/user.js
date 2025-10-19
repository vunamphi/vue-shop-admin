// src/store/user.js
import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useUserStore = defineStore("user", () => {
  const user = ref(JSON.parse(localStorage.getItem("user")) || null);

  // 🟢 Lấy thông tin người dùng từ JSON Server
  async function fetchUser(id) {
    try {
      const res = await axios.get(`http://localhost:3000/users/${id}`);
      user.value = res.data;
      localStorage.setItem("user", JSON.stringify(user.value));
    } catch (err) {
      console.error("Lỗi tải thông tin người dùng:", err);
    }
  }

  // 🟠 Cập nhật thông tin người dùng
  async function updateUser(updatedData) {
    try {
      const res = await axios.put(
        `http://localhost:3000/users/${user.value.id}`,
        updatedData
      );
      user.value = res.data;
      localStorage.setItem("user", JSON.stringify(res.data));
      alert("✅ Cập nhật thông tin thành công!");
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      alert("❌ Cập nhật thất bại!");
    }
  }

  // 🔴 Xóa tài khoản
  async function deleteUser() {
    if (!confirm("⚠️ Bạn có chắc chắn muốn xóa tài khoản này không?")) return;

    try {
      await axios.delete(`http://localhost:3000/users/${user.value.id}`);
      alert("🗑️ Tài khoản đã được xóa!");
      localStorage.removeItem("user");
      user.value = null;
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      alert("❌ Không thể xóa tài khoản!");
    }
  }

  return { user, fetchUser, updateUser, deleteUser };
});
