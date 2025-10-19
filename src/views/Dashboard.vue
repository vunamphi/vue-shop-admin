<template>
  <div class="d-flex">
    <Sidebar />
    <div class="flex-fill bg-light p-4" style="height: 100vh; overflow-y: auto;">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import Sidebar from "../components/Sidebar.vue";
</script>
