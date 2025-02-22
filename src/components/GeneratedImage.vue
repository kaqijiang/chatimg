<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTimeoutFn } from '@vueuse/core';
import { apiService } from '../services/api';

const props = defineProps<{
  imageUrl: string;
  prompt: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'updatePrompt', prompt: string): void;
  (e: 'generateImage', prompt: string): void;
}>();

const downloading = ref(false);
const editedPrompt = ref(props.prompt);
const promptHistory = ref<string[]>([]);
const maxHistoryItems = 2;
const showCopyTooltip = ref(false);
const isUpdatingPrompt = ref(false);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

watch(() => props.prompt, (newValue) => {
  editedPrompt.value = newValue;
});

const placeholderWidth = 800;
const placeholderHeight = 600;
const placeholderImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${placeholderWidth}' height='${placeholderHeight}'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3C/svg%3E`;

const downloadImage = async () => {
  if (downloading.value || props.loading || isUpdatingPrompt.value) return;
  try {
    downloading.value = true;
    const response = await fetch(props.imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-image.png';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading image:', error);
  } finally {
    downloading.value = false;
  }
};

const { start: startCopyTooltipTimer } = useTimeoutFn(() => {
  showCopyTooltip.value = false;
}, 2000);

const copyPrompt = async () => {
  try {
    await navigator.clipboard.writeText(editedPrompt.value);
    showCopyTooltip.value = true;
    startCopyTooltipTimer();
  } catch (error) {
    console.error('Failed to copy text:', error);
  }
};

const handleRegenerate = async () => {
  if (isUpdatingPrompt.value || props.loading || downloading.value) return;
  try {
    isUpdatingPrompt.value = true;
    const optimizedPrompt = await apiService.generatePrompt(editedPrompt.value);
    
    if (promptHistory.value.length >= maxHistoryItems) {
      promptHistory.value.shift();
    }
    promptHistory.value.push(editedPrompt.value);
    
    editedPrompt.value = optimizedPrompt;
    emit('updatePrompt', optimizedPrompt);
  } catch (error) {
    console.error('Error regenerating prompt:', error);
  } finally {
    isUpdatingPrompt.value = false;
  }
};

const handleNewPrompt = () => {
  if (isUpdatingPrompt.value || props.loading || downloading.value) return;
  emit('generateImage', editedPrompt.value);
};
</script>

<template>
  <div class="card">
    <h2 class="text-xl font-semibold mb-6">Generated Image</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Left Column - Prompts and Controls -->
      <div class="space-y-6">
        <div class="space-y-4">
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex justify-between items-center mb-2">
              <h3 class="text-sm font-medium text-gray-700">Prompt Used:</h3>
              <div class="relative">
                <button 
                  @click="copyPrompt"
                  class="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
                <div
                  v-if="showCopyTooltip"
                  class="absolute right-0 top-6 bg-gray-800 text-white text-xs px-2 py-1 rounded"
                >
                  Copied!
                </div>
              </div>
            </div>
            <textarea
              ref="textareaRef"
              v-model="editedPrompt"
              class="input h-[180px] resize-none"
              placeholder="Edit your prompt..."
              :disabled="isUpdatingPrompt || loading || downloading"
            ></textarea>
          </div>

          <div class="bg-gray-50 rounded-lg p-4 min-h-[140px]">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Prompt History:</h3>
            <div v-if="promptHistory.length > 0" class="space-y-2 overflow-y-auto">
              <div 
                v-for="(prompt, index) in promptHistory.slice().reverse()" 
                :key="index"
                class="text-gray-600 text-sm"
              >
                {{ prompt }}
              </div>
            </div>
            <div v-else class="text-gray-400 text-sm">
              No history available
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <button 
              @click="handleRegenerate"
              :disabled="isUpdatingPrompt || loading || downloading"
              class="btn btn-primary flex-1 flex items-center justify-center gap-2 h-10"
            >
              <span 
                v-if="isUpdatingPrompt" 
                class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"
              />
              {{ isUpdatingPrompt ? 'Updating...' : 'Update Prompt' }}
            </button>
            <button 
              @click="handleNewPrompt"
              :disabled="loading || isUpdatingPrompt || downloading"
              class="btn btn-secondary flex-1 flex items-center justify-center gap-2 h-10"
            >
              <span 
                v-if="loading" 
                class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"
              />
              {{ loading ? 'Generating...' : 'Generate' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column - Generated Image -->
      <div class="relative flex flex-col items-center justify-center">
        <div class="w-full aspect-[4/3] relative rounded-lg overflow-hidden bg-gray-100">
          <div 
            v-if="loading" 
            class="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded-lg"
          >
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
          <img 
            :src="imageUrl || placeholderImage" 
            alt="Generated image"
            class="w-full h-full object-cover"
          />
        </div>
        <button 
          @click="downloadImage"
          :disabled="downloading || loading || !imageUrl || isUpdatingPrompt"
          class="btn btn-secondary h-10 mt-4 flex items-center justify-center gap-2"
        >
          <span 
            v-if="downloading" 
            class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"
          />
          {{ downloading ? 'Downloading...' : 'Download' }}
        </button>
      </div>
    </div>
  </div>
</template>