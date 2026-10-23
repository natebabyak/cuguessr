export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  const params = [`width=${width}`, `quality=${quality ?? 75}`, "format=auto"];

  return `${import.meta.env.VITE_CDN_URL}/cdn-cgi/image/${params.join(",")}/${src}`;
}
