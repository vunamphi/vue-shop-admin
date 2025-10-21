import axios from "axios";
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user")) || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === "admin",
    currentUser: (state) => state.user,
  },

  actions: {
    async login(username, password) {
      try {  
        const { data: users } = await axios.get("http://localhost:3000/users");
        const found = users.find(
          (u) => u.username === username && u.password === password
        );

        if (!found) throw new Error("Sai tên đăng nhập hoặc mật khẩu!");

        localStorage.setItem("user", JSON.stringify(found));
        this.user = found;
        return found;
      } catch (err) {
        console.error("Lỗi đăng nhập:", err);
        throw err;
      }
    },

    async register(username, password, email, age, gender, role = "user") {
      try {
        const newUser = {
          username,
          password,
          email,
          age,
          gender,
          role,
          hasCompletedTest: false,
          desiredProducts: [],
        };

        const res = await axios.post("http://localhost:3000/users", newUser);
        return res.data;
      } catch (err) {
        console.error("Lỗi đăng ký:", err);
        throw err;
      }
    },

    async updateUser(updatedData) {
      try {
        const updatedUser = { ...this.user, ...updatedData };
        await axios.put(
          `http://localhost:3000/users/${this.user.id}`,
          updatedUser
        );

        this.user = updatedUser;
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (err) {
        console.error("Lỗi cập nhật thông tin:", err);
        throw err;
      }
    },

    logout() {
      this.user = null;
      localStorage.removeItem("user");
    },
  },
});
