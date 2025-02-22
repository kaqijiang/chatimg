<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { apiService } from '../services/api';

const props = defineProps<{
  optimizedPrompt: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'confirm', prompt: string): void;
}>();

const editedPrompt = ref(props.optimizedPrompt);
const translatedText = ref('');
const isTranslating = ref(false);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

// Watch for props changes to update the textarea
watch(() => props.optimizedPrompt, (newValue) => {
  editedPrompt.value = newValue;
});

// Auto-adjust textarea height
const adjustTextareaHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`;
  }
};

onMounted(() => {
  adjustTextareaHeight();
});

watch(editedPrompt, () => {
  adjustTextareaHeight();
});

const handleConfirm = async () => {
  if (props.loading || isTranslating.value) return;
  emit('confirm', editedPrompt.value);
};

const translateToZh = async () => {
  if (props.loading || isTranslating.value) return;
  try {
    isTranslating.value = true;
    const translated = await apiService.translateToZh(editedPrompt.value);
    translatedText.value = translated;
  } catch (error) {
    console.error('Translation error:', error);
    translatedText.value = '翻译失败，请稍后重试';
  } finally {
    isTranslating.value = false;
  }
};
</script>

<template>
  <div class="card">
    <h2 class="text-xl font-semibold mb-4">Optimized Prompt</h2>
    <div class="space-y-4">
      <div class="relative">
        <textarea
          ref="textareaRef"
          v-model="editedPrompt"
          class="input min-h-[120px] max-h-[400px] h-auto resize-y overflow-y-auto"
          placeholder="Edit the optimized prompt..."
          :disabled="loading || isTranslating"
          @input="adjustTextareaHeight"
        ></textarea>
        <button 
          @click="translateToZh"
          class="absolute top-2 right-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200"
          :disabled="isTranslating || loading || !editedPrompt.trim()"
        >
          {{ isTranslating ? '翻译中...' : '翻译成中文' }}
        </button>
      </div>

      <div 
        v-if="translatedText"
        class="bg-gray-50 rounded-lg p-4 mt-2"
      >
        <h3 class="text-sm font-medium text-gray-700 mb-2">中文翻译：</h3>
        <p class="text-gray-600 whitespace-pre-wrap">{{ translatedText }}</p>
      </div>

      <button 
        @click="handleConfirm"
        class="btn btn-primary w-full flex items-center justify-center gap-2"
        :disabled="loading || isTranslating || !editedPrompt.trim()"
      >
        <span 
          v-if="loading" 
          class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"
        />
        {{ loading ? 'Processing...' : 'Generate Image' }}
      </button>
    </div>
  </div>
</template>