import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静态导出配置
  output: 'export',
  
  // 禁用图片优化（静态导出不支持）
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cn.bing.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bing.img.run',
        pathname: '/**',
      },
    ],
  },
  
  // 禁用服务端功能
  trailingSlash: true,
  
  // 基础路径配置（GitHub Pages需要）
  basePath: process.env.GITHUB_ACTIONS ? '/homepage' : '',
  assetPrefix: process.env.GITHUB_ACTIONS ? '/homepage/' : '',
  
  // 构建配置
  distDir: 'out',
  
  // 环境变量
  env: {
    NEXT_OUTPUT: process.env.NEXT_OUTPUT || 'export',
  },
};

export default nextConfig;
