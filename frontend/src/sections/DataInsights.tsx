import React from 'react';
import { DataParticles } from './DataParticles';

export const DataInsights: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden" style={{ height: '80vh', minHeight: '500px' }}>
      {/* Particle Canvas Background */}
      <DataParticles />

      {/* Content Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/30 via-transparent to-[#0A0A0A]/30 pointer-events-none" />
        <div className="relative text-center max-w-3xl">
          <span className="reveal text-xs font-medium text-zinc-500 uppercase tracking-[0.3em] mb-6 block">
            How It Works
          </span>
          <h2 className="reveal text-3xl md:text-5xl font-bold text-white tracking-tight mb-6 drop-shadow-lg">
            从原始数据到战略洞察
          </h2>
          <p className="reveal text-base md:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto drop-shadow-md">
            从项目任务书、规划条件到多专业综合分析报告，
            将复杂的项目信息在几分钟内转化为可执行的战略决策，
            而非数周的传统人工分析
          </p>
        </div>
      </div>
    </section>
  );
};
