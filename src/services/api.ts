import { ApiResponse, ImageGenerationResponse } from '../types';

const API_URL = 'https://purple-cell-4006.kaqijiang.workers.dev/';
const API_KEY = 'sk-ExBt7XFo9ldcohYALTAia7k957T08CmPy7s4DXNdW7G9Lyx3';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`
};


export const apiService = {
  async generatePrompt(prompt: string): Promise<string> {
    const response = await fetch(`${API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        messages: [
          {
            role: 'user',
            content: `Create a detailed and specific prompt for an image generation model to generate an image for the provided scene. Please consider important elements such as the main theme, key subjects, potential artistic style, suitable color scheme, lighting mood, and any other relevant visual cues. For instance, if the topic is about futuristic architecture, the prompt might be something like 'A digital painting of a futuristic cityscape at sunset, featuring towering skyscrapers with neon lights, in a photorealistic style with highly detailed and sharp focus, with a color palette of cool blues and vibrant neon hues, with dramatic lighting.' Or if the topic is about the beauty of autumn forests, a suitable prompt might be 'An impressionistic painting of a dense autumn forest, with a footpath covered in golden leaves, mimicking the style of Claude Monet, with a soft focus and a warm color palette of reds, oranges, and golds, under a soft and natural sunlight.\n Return only the generated prompt without any explanations. \nHere is the scene:${prompt} \n`
          }
        ],
        stream: false
      }),
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse = await response.json();

    if (!result.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response format');
    }

    return result.choices[0].message.content;
  },

  async generateStoryResponse(prompt: string): Promise<string> {
    const response = await fetch(`${API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        messages: [
          {
            role: 'user',
            content: `As an interactive storyteller, create an engaging and descriptive response to the user's input. Focus on creating a vivid scene with rich visual details that could be translated into an image. The response should be narrative and atmospheric.\n\nUser input: ${prompt}`
          }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse = await response.json();
    return result.choices[0].message.content;
  },

  async extractKeywords(text: string): Promise<string> {
    const response = await fetch(`${API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        messages: [
          {
            role: 'user',
            content: `Extract key visual elements and themes from the following text. Focus on elements that would be important for creating an image. Present them as a concise, comma-separated list:\n\n${text}`
          }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse = await response.json();
    return result.choices[0].message.content;
  },

  async generateImagePrompt(keywords: string): Promise<string> {
    const response = await fetch(`${API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        messages: [
          {
            role: 'user',
            content: `Create a detailed image generation prompt based on these key elements: ${keywords}. The prompt should be specific and include style, mood, lighting, and composition details.`
          }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse = await response.json();
    return result.choices[0].message.content;
  },

  async translateToZh(text: string): Promise<string> {
    const response = await fetch(`${API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant'
          },
          {
            role: 'user',
            content: `翻译内容为中文格式保持不变:${text}`
          }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse = await response.json();
    return result.choices[0].message.content;
  },

  async generateImage(prompt: string): Promise<string> {
    const response = await fetch(`${API_URL}/v1/images/generations`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt,
        model: 'stableimagecore'
      })
    });

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('生成图片失败：提示词格式不正确或不支持，请使用英文提示词');
      }
      throw new Error(`生成图片失败：${response.status}`);
    }

    const result: ImageGenerationResponse = await response.json();

    if (!result.data?.[0]?.url) {
      throw new Error('Invalid image generation response');
    }

    return result.data[0].url;
  }
};