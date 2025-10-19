import { defineStore } from "pinia";

export const useWishlistStore = defineStore("wishlist", {
  state: () => ({
    wishlist: JSON.parse(localStorage.getItem("wishlist") || "[]"),
  }),
  actions: {
    toggleFavorite(product) {
      const index = this.wishlist.findIndex(p => p.id === product.id);
      if (index >= 0) this.wishlist.splice(index, 1);
      else this.wishlist.push(product);
      localStorage.setItem("wishlist", JSON.stringify(this.wishlist));
    },
    isFavorite(id) {
      return this.wishlist.some(p => p.id === id);
    },
  },
});
