export interface ApiMessage {
  role: string;
  content: string;
}

export interface ApiChoice {
  message: ApiMessage;
}

export interface ApiResponse {
  choices: ApiChoice[];
}

export interface ImageData {
  revised_prompt: string;
  url: string;
}

export interface ImageGenerationResponse {
  created: number;
  data: ImageData[];
  model: string;
}