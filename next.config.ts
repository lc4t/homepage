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
  
  // 基础路径配置
  // 当使用自定义域名时，不需要 basePath 和 assetPrefix
  basePath: '',
  assetPrefix: '',
  
  // 构建配置
  // 开发模式使用默认的.next目录
  distDir: process.env.NODE_ENV === 'production' ? 'out' : '.next',
  
  // 环境变量
  env: {
    NEXT_OUTPUT: process.env.NEXT_OUTPUT || 'export',
  },
};

export default nextConfig;
