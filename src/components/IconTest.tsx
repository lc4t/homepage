'use client';

import React from 'react';
import { IconComponent, IconUtils } from './IconComponent';

// 图标测试组件，用于展示各种图标配置的效果
export function IconTest() {
  const testConfigs = [
    {
      title: 'Auto - Emoji',
      config: { type: 'auto' as const, value: '🚀' },
      url: undefined
    },
    {
      title: 'Auto - URL',
      config: { type: 'auto' as const, value: 'https://github.com/favicon.ico' },
      url: undefined
    },
    {
      title: 'Favicon - GitHub',
      config: { type: 'favicon' as const },
      url: 'https://github.com'
    },
    {
      title: 'SVG - Simple',
      config: {
        type: 'svg' as const,
        svg: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>'
      },
      url: undefined
    },
    {
      title: 'Badge - GitHub',
      config: IconUtils.createBadge({
        message: 'GitHub',
        color: 'black',
        logo: 'github'
      }),
      url: undefined
    },
    {
      title: 'Badge - Version',
      config: IconUtils.createBadge({
        label: 'version',
        message: 'v1.0.0',
        color: 'blue',
        style: 'flat-square'
      }),
      url: undefined
    },
    {
      title: 'Emoji',
      config: IconUtils.createEmoji('📱'),
      url: undefined
    },
    {
      title: 'Text - Custom',
      config: { type: 'text' as const, value: 'API' },
      url: undefined
    },
    {
      title: 'Fallback Test',
      config: { type: 'auto' as const, value: 'invalid-url', fallback: { type: 'emoji' as const, value: '❌' } },
      url: undefined
    }
  ];

  return (
    <div className="p-6 bg-white/10 rounded-lg backdrop-blur-md">
      <h2 className="text-xl font-bold text-white mb-4">图标系统测试</h2>
      <div className="grid grid-cols-3 gap-4">
        {testConfigs.map((test, index) => (
          <div key={index} className="flex flex-col items-center p-4 bg-white/5 rounded-lg">
            <IconComponent
              icon={test.config}
              title={test.title}
              url={test.url}
              size={48}
            />
            <span className="text-white text-xs mt-2 text-center">{test.title}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-white/70 text-sm">
        <p>这个测试组件展示了各种图标配置的效果。</p>
        <p>在实际使用中，可以删除这个组件。</p>
      </div>
    </div>
  );
}
