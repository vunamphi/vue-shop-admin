<template>
  <nav v-if="totalPages > 1">
    <ul class="pagination justify-content-center">
      <li class="page-item" :class="{ disabled: page === 1 }">
        <button class="page-link" @click="$emit('update', page - 1)">«</button>
      </li>

      <li
        v-for="n in totalPages"
        :key="n"
        class="page-item"
        :class="{ active: n === page }"
      >
        <button class="page-link" @click="$emit('update', n)">{{ n }}</button>
      </li>

      <li class="page-item" :class="{ disabled: page === totalPages }">
        <button class="page-link" @click="$emit('update', page + 1)">»</button>
      </li>
    </ul>
  </nav>
</template>

<script setup>
defineProps({
  page: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
});
</script>

<style scoped>
.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}
</style>
