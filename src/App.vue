<script setup lang="ts">
import { ref } from 'vue';
import StepIndicator from './components/StepIndicator.vue';
import PromptInput from './components/PromptInput.vue';
import OptimizedPrompt from './components/OptimizedPrompt.vue';
import GeneratedImage from './components/GeneratedImage.vue';
import StoryMode from './components/StoryMode.vue';
import { apiService } from './services/api';

const mode = ref<'default' | 'story'>('default');
const currentStep = ref(1);
const originalPrompt = ref('');
const optimizedPrompt = ref('');
const generatedImageUrl = ref('');
const isLoading = ref(false);
const error = ref('');

const optimizePrompt = async (prompt: string) => {
  error.value = '';
  originalPrompt.value = prompt;
  try {
    isLoading.value = true;
    const optimized = await apiService.generatePrompt(prompt);
    optimizedPrompt.value = optimized;
    currentStep.value = 2;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred while generating the prompt';
    console.error('Error optimizing prompt:', err);
  } finally {
    isLoading.value = false;
  }
};

const generateImage = async (prompt: string) => {
  error.value = '';
  try {
    isLoading.value = true;
    const imageUrl = await apiService.generateImage(prompt);
    generatedImageUrl.value = imageUrl;
    currentStep.value = 3;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred while generating the image';
    console.error('Error generating image:', err);
  } finally {
    isLoading.value = false;
  }
};

const handleUpdatePrompt = (prompt: string) => {
  optimizedPrompt.value = prompt;
};

const handleGenerateImage = async (prompt: string) => {
  await generateImage(prompt);
};

const handleNewPrompt = () => {
  currentStep.value = 1;
  originalPrompt.value = '';
  optimizedPrompt.value = '';
  generatedImageUrl.value = '';
  error.value = '';
};

const handleStepClick = (step: number) => {
  currentStep.value = step;
};

const toggleMode = () => {
  mode.value = mode.value === 'default' ? 'story' : 'default';
  handleNewPrompt();
};
</script>

<template>
  <div class="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto" :class="{
      'max-w-[50rem]': mode === 'default' && currentStep !== 3,
      'max-w-[80rem]': mode === 'default' && currentStep === 3
    }">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900 hidden sm:block">
          AI Image Generator
        </h1>
        <h1 class="text-2xl font-bold text-gray-900 sm:hidden">
          AI Gen
        </h1>
        <button 
          @click="toggleMode"
          class="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors"
        >
          {{ mode === 'default' ? 'Story' : 'Default' }}
        </button>
      </div>
      
      <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {{ error }}
      </div>
      
      <!-- Default Mode -->
      <template v-if="mode === 'default'">
        <StepIndicator 
          :current-step="currentStep"
          @step-click="handleStepClick"
        />
        
        <div class="space-y-8">
          <PromptInput
            v-if="currentStep === 1"
            @submit="optimizePrompt"
            :loading="isLoading"
          />
          
          <OptimizedPrompt
            v-if="currentStep === 2"
            :optimized-prompt="optimizedPrompt"
            :loading="isLoading"
            @confirm="generateImage"
          />
          
          <GeneratedImage
            v-if="currentStep === 3"
            :image-url="generatedImageUrl"
            :prompt="optimizedPrompt"
            :loading="isLoading"
            @update-prompt="handleUpdatePrompt"
            @generate-image="handleGenerateImage"
          />
        </div>
      </template>

      <!-- Story Mode -->
      <StoryMode v-else />
    </div>
  </div>
</template>