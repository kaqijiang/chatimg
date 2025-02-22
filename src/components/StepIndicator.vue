<script setup lang="ts">
const props = defineProps<{
  currentStep: number;
}>();

const emit = defineEmits<{
  (e: 'stepClick', step: number): void;
}>();

const handleStepClick = (step: number) => {
  if (step <= props.currentStep) {
    emit('stepClick', step);
  }
};
</script>

<template>
  <div class="flex items-center justify-center space-x-4 mb-8">
    <div 
      class="flex items-center"
      v-for="step in 3" 
      :key="step"
    >
      <div 
        class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer transition-colors duration-200"
        :class="[
          currentStep >= step 
            ? 'bg-primary text-white hover:bg-primary/90' 
            : 'bg-gray-200 text-gray-600 cursor-not-allowed'
        ]"
        @click="handleStepClick(step)"
      >
        {{ step }}
      </div>
      <div 
        v-if="step < 3"
        class="w-16 h-0.5 mx-2"
        :class="[
          currentStep > step 
            ? 'bg-primary' 
            : 'bg-gray-200'
        ]"
      ></div>
    </div>
  </div>
</template>