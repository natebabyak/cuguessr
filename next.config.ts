import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
  reactCompiler: true,
  typedRoutes: true,
};

export default nextConfig;
