// 📁 src/store/order.js
import { defineStore } from "pinia";
import axios from "../api/api";


export const useOrderStore = defineStore("order", {
  state: () => ({
    orders: [],
    loading: false,
    currentOrderId: null, // ← MỚI: lưu orderId khi VNPay
  }),

  actions: {
    async addOrder(order) {
      this.loading = true;
      try {
        const response = await axios.post(`/orders`, order);
        const data = response.data;

        console.log("📦 Order response:", data);

        // VNPay: redirect ngay
        if (data?.paymentUrl) {
          this.currentOrderId = data.orderId || data.id; // ← Lưu orderId
          window.location.href = data.paymentUrl;
          return { type: 'vnpay', orderId: this.currentOrderId };
        }

        // COD: lưu order vào state
        this.orders.unshift(data); // Thêm đầu danh sách
        return { type: 'cod', order: data };

      } catch (error) {
        console.error("❌ Lỗi khi thêm đơn hàng:", error.response?.data || error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async fetchUserOrders(username) {
      this.loading = true;
      try {
        const encodedUser = encodeURIComponent(username);
        const response = await axios.get(`/orders?user=${encodedUser}`);
        this.orders = response.data;
      } catch (error) {
        console.error("❌ Lỗi khi tải đơn hàng của người dùng:", error);
      } finally {
        this.loading = false;
      }
    },

    async updateStatus(orderId, newStatus) {
      try {
        const response = await axios.patch(`/orders/${orderId}`, {
          status: newStatus,
        });

        const updatedOrder = response.data.order || response.data;

        const index = this.orders.findIndex((o) => String(o.id) === String(orderId));
        if (index !== -1) {
          this.orders[index] = updatedOrder;
        } else {
          this.orders.push(updatedOrder);
        }

        alert(`✅ Đã cập nhật trạng thái đơn hàng #${orderId} thành "${newStatus}"`);
        return updatedOrder;
      } catch (error) {
        console.error("❌ Lỗi khi cập nhật trạng thái:", error);
        throw error;
      }
    },
  },
});

