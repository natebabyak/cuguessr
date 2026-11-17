export function photoUrl(objectKey: string, width: number, rotation = 0) {
  const key = objectKey.split("/").map(encodeURIComponent).join("/");
  const rotate = rotation ? `,rotate=${rotation}` : "";
  return `${import.meta.env.VITE_CDN_URL}/cdn-cgi/image/width=${width},quality=75,format=auto,fit=scale-down${rotate}/photos/${key}`;
}

export function photoDimensions(width: number, height: number, rotation = 0) {
  return rotation % 180 === 0 ? { width, height } : { width: height, height: width };
}
