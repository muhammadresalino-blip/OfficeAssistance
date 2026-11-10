import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // pptxgenjs memakai import('node:fs') yang dijaga guard isNode; arahkan ke stub di client.
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^node:(fs|https|path|os|zlib|crypto|stream|buffer|child_process)$/,
          path.join(rootDir, 'lib', 'node-stub.js')
        )
      );
    }
    return config;
  },
};
export default nextConfig;
