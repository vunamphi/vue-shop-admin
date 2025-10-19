import { createRouter, createWebHistory } from "vue-router";
import Shop from "./views/Shop.vue";
import ProductDetail from "./views/ProductDetail.vue";
import Login from "./views/Login.vue";
import Register from "./views/Register.vue";
import Dashboard from "./views/Dashboard.vue";
import Users from "./views/Users.vue";
import Products from "./views/Products.vue";
import Categories from "./views/Categories.vue";
import NotFound from "./views/NotFound.vue";
import Profile from "./views/Profile.vue";
import Test from "./views/Test.vue";
import OrderHistory from "./views/OrderHistory.vue";
import Checkout from "./views/Checkout.vue";
import Wishlist from "@/views/Wishlist.vue";
import Favorites from "@/views/Favorites.vue";
import OrderManagement from "@/views/OrderManagement.vue";

const routes = [
  { path: "/checkout", component: Checkout },
  { path: "/", redirect: "/shop" },
  { path: "/shop", component: Shop },
  { path: "/product/:id", component: ProductDetail },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/cart", component: () => import("./views/Cart.vue") },
  { path: "/orders", component: OrderHistory, meta: { requiresAuth: true } },
  { path: "/wishlist", name: "Wishlist", component: Wishlist },
  { path: "/favorites", component: Favorites },
  { path: "/profile", component: Profile, meta: { requiresAuth: true } },
  { path: "/test", component: Test, meta: { requiresAuth: true } },
  {
    path: "/dashboard",
    component: Dashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: "", redirect: "/dashboard/products" },
      { path: "users", component: Users },
      { path: "products", component: Products },
      { path: "categories", component: Categories },
      { path: "orders", component: OrderManagement },
    ],
  },
  { path: "/:pathMatch(.*)*", component: NotFound },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (to.meta.requiresAuth && !user) {
    alert("⚠️ Vui lòng đăng nhập để tiếp tục!");
    return next("/login");
  }

  if (to.meta.requiresAdmin && user?.role !== "admin") {
    alert("🚫 Bạn không có quyền truy cập trang quản trị!");
    return next("/shop");
  }

  if (
    user &&
    user.role === "user" &&
    !user.hasCompletedTest &&
    to.path !== "/test"
  ) {
    return next("/test");
  }

  next();
});

export default router;
