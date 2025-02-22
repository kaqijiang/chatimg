<script setup lang="ts">
import { ref, computed } from 'vue';
import { useWindowSize } from '@vueuse/core';
import { apiService } from '../services/api';

const userInput = ref('');
const storyResponse = ref('');
const keywords = ref('');
const imagePrompt = ref('');
const generatedImageUrl = ref('');
const isLoading = ref(false);
const error = ref('');
const activeTab = ref('chat');

const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);

const generateResponse = async () => {
  if (!userInput.value.trim() || isLoading.value) return;
  
  error.value = '';
  storyResponse.value = '';
  keywords.value = '';
  imagePrompt.value = '';
  generatedImageUrl.value = '';
  
  try {
    isLoading.value = true;

    const response = await apiService.generateStoryResponse(userInput.value);
    storyResponse.value = response;

    const extractedKeywords = await apiService.extractKeywords(response);
    keywords.value = extractedKeywords;

    const prompt = await apiService.generateImagePrompt(keywords.value);
    imagePrompt.value = prompt;

    const imageUrl = await apiService.generateImage(prompt);
    generatedImageUrl.value = imageUrl;

    if (isMobile.value) {
      activeTab.value = 'image';
    }

  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
    console.error('Error in story mode:', err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="max-w-[100rem] mx-auto">
    <!-- Mobile Tabs -->
    <div v-if="isMobile" class="mb-6">
      <div class="flex rounded-lg bg-gray-100 p-1">
        <button
          v-for="tab in ['chat', 'summary', 'image']"
          :key="tab"
          @click="activeTab = tab"
          class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors"
          :class="activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-gray-600'"
        >
          {{ tab === 'chat' ? 'Chat' : tab === 'summary' ? 'Summary' : 'Image' }}
        </button>
      </div>
    </div>

    <!-- Desktop Layout -->
    <div 
      class="grid gap-6"
      :class="isMobile ? '' : 'md:grid-cols-2 md:grid-rows-[auto_1fr] md:h-auto'"
    >
      <!-- Chat Input (Left) -->
      <div 
        v-show="!isMobile || (isMobile && activeTab === 'chat')"
        class="card h-full"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Chat</h2>
          <div class="text-sm text-gray-500">
            {{ isLoading ? 'Generating response...' : 'Ready' }}
          </div>
        </div>
        <div class="space-y-4">
          <textarea
            v-model="userInput"
            class="input h-32 resize-none"
            placeholder="Start your story here..."
            :disabled="isLoading"
          ></textarea>
          <button 
            @click="generateResponse"
            class="btn btn-primary w-full flex items-center justify-center gap-2"
            :disabled="!userInput.trim() || isLoading"
          >
            <span 
              v-if="isLoading" 
              class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"
            />
            {{ isLoading ? 'Generating...' : 'Generate' }}
          </button>
        </div>
        
        <!-- Story Response -->
        <div v-if="storyResponse" class="mt-4">
          <h3 class="font-medium text-gray-700 mb-2">Story:</h3>
          <div class="prose max-w-none bg-gray-50 rounded-lg p-4">
            <p class="whitespace-pre-wrap text-gray-700 leading-relaxed">{{ storyResponse }}</p>
          </div>
        </div>
      </div>

      <!-- Summary Section (Right) -->
      <div 
        v-show="!isMobile || (isMobile && activeTab === 'summary')"
        class="card h-full"
      >
        <h2 class="text-xl font-semibold mb-4">Summary</h2>
        <!-- Keywords -->
        <div class="mb-6">
          <h3 class="font-medium text-gray-700 mb-2">Key Elements:</h3>
          <div class="bg-gray-50 rounded-lg p-4 min-h-[100px]">
            <p v-if="keywords" class="text-gray-700 leading-relaxed">{{ keywords }}</p>
            <p v-else class="text-gray-400">No key elements generated yet</p>
          </div>
        </div>

        <!-- Image Prompt -->
        <div>
          <h3 class="font-medium text-gray-700 mb-2">Generated Image Prompt:</h3>
          <div class="bg-gray-50 rounded-lg p-4 min-h-[100px]">
            <p v-if="imagePrompt" class="text-gray-700 leading-relaxed">{{ imagePrompt }}</p>
            <p v-else class="text-gray-400">No image prompt generated yet</p>
          </div>
        </div>
      </div>

      <!-- Generated Image (Bottom) -->
      <div 
        v-show="!isMobile || (isMobile && activeTab === 'image')"
        class="card md:col-span-2"
      >
        <h2 class="text-xl font-semibold mb-4">Generated Image</h2>
        <div class="flex flex-col items-center">
          <div class="relative w-full max-w-4xl mx-auto rounded-lg overflow-hidden bg-gray-100 aspect-[16/9]">
            <div 
              v-if="isLoading" 
              class="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75"
            >
              <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
            <div v-else-if="!generatedImageUrl" class="flex items-center justify-center h-full text-gray-400">
              <p>No image generated yet</p>
            </div>
            <img 
              v-else
              :src="generatedImageUrl" 
              alt="Generated image"
              class="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>