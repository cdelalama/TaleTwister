export interface UserState {
    titles: Array<{ content: string; index: number }>;
    paragraphs: Array<{ content: string; index: number }>;
    images: Array<{ index: number; src: string }>;
    selectedImages: Array<{ index: number; src: string }>;
    currentImage: number;
  }
  