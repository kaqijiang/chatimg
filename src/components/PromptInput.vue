<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'submit', value: string): void;
}>();

const prompt = ref('');

const handleSubmit = async () => {
  if (prompt.value.trim()) {
    emit('submit', prompt.value);
  }
};
</script>

<template>
  <div class="card">
    <h2 class="text-xl font-semibold mb-4">Enter Your Prompt</h2>
    <div class="space-y-4">
      <textarea
        v-model="prompt"
        class="input h-32 resize-none"
        placeholder="Describe the image you want to generate..."
        :disabled="loading"
      ></textarea>
      <button 
        @click="handleSubmit"
        class="btn btn-primary w-full flex items-center justify-center gap-2"
        :disabled="!prompt.trim() || loading"
      >
        <span 
          v-if="loading" 
          class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"
        />
        {{ loading ? 'Processing...' : 'Generate' }}
      </button>
    </div>
  </div>
</template>