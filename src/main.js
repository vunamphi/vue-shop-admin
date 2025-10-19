// src/main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";

// ✅ Bootstrap 5
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// ✅ SCSS tùy chỉnh (giao diện của bạn)
import "./assets/styles.scss";

// ✅ Khởi tạo App
const app = createApp(App);

// ✅ Kích hoạt Pinia & Router
const pinia = createPinia();
app.use(pinia);
app.use(router);

// ✅ Mount app vào DOM
app.mount("#app");
