export function generateHTML(
  titles: Array<{ content: string; index: number }>,
  paragraphs: Array<{ content: string; index: number }>,
  images: Array<{ index: number; src: string }>,
  selectedImages: Array<{ index: number; src: string }>
): string {
  const allElements = [
    ...titles.map((t) => ({
      type: "title",
      content: t.content,
      index: t.index,
    })),
    ...paragraphs.map((p) => ({
      type: "paragraph",
      content: p.content,
      index: p.index,
    })),
    ...images
      .filter((image) =>
        selectedImages.some((selectedImage) => selectedImage.src === image.src)
      )
      .map((image) => ({
        type: "image",
        content: image.src,
        index: image.index,
      })),
  ];

  const sortedElements = allElements.sort((a, b) => a.index - b.index);

  const contentHTML = sortedElements
    .map((element: { type: string; content: string; index: number }) => {
      if (element.type === "title") {
        return `<h2>${element.content}</h2>`;
      } else if (element.type === "paragraph") {
        return `<p>${element.content}</p>`;
      } else if (element.type === "image") {
        return `<img src="${element.content}" alt="" />`;
      }
    })
    .join("\n");

  return `<html>\n<head>\n<meta charset="utf-8">\n</head>\n<body>\n${contentHTML}\n</body>\n</html>`;
}
