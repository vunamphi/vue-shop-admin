// 📁 src/store/order.js
import { defineStore } from "pinia";
import axios from "axios";

const BASE = "http://localhost:3000"; // <-- ensure matches server PORT

export const useOrderStore = defineStore("order", {
  state: () => ({
    orders: [],
    loading: false,
  }),

  actions: {
    async fetchAllOrders() {
      this.loading = true;
      try {
        const res = await axios.get(`${BASE}/orders`);
        this.orders = res.data;
      } catch (err) {
        console.error("❌ Lỗi tải tất cả đơn hàng:", err);
      } finally {
        this.loading = false;
      }
    },

    async fetchUserOrders(username) {
      this.loading = true;
      try {
        const res = await axios.get(`${BASE}/orders?user=${encodeURIComponent(username)}`);
        this.orders = res.data;
      } catch (err) {
        console.error("❌ Lỗi tải đơn hàng người dùng:", err);
      } finally {
        this.loading = false;
      }
    },

    async addOrder(order) {
      try {
        const res = await axios.post(`${BASE}/orders`, order);
        // If server returns {paymentUrl} for vnpay, frontend should handle that case
        if (res.data && res.data.paymentUrl) {
          return res.data; // caller handles payment redirect
        }
        // otherwise res.data is order object
        this.orders.push(res.data);
        return res.data;
      } catch (err) {
        console.error("❌ Lỗi thêm đơn hàng:", err);
        throw err;
      }
    },

    async updateStatus(id, status) {
      try {
        const res = await axios.patch(`${BASE}/orders/${id}`, { status });
        const updatedOrder = res.data.order || res.data;
        const idx = this.orders.findIndex((o) => String(o.id) === String(id));
        if (idx !== -1) {
          this.orders[idx] = updatedOrder;
        } else {
          this.orders.push(updatedOrder);
        }
        alert(`✅ Cập nhật trạng thái đơn hàng #${id} thành "${status}"`);
        return updatedOrder;
      } catch (err) {
        console.error("❌ Lỗi cập nhật trạng thái:", err);
        throw err;
      }
    },
  },
});
