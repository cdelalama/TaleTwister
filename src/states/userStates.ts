export const userStates = new Map<
  number,
  {
    titles: Array<{ content: string; index: number }>;
    paragraphs: Array<{ content: string; index: number }>;
    images: Array<{ index: number; src: string }>;
    selectedImages: Array<{ index: number; src: string }>;
    currentImage: number;
  }
>();
