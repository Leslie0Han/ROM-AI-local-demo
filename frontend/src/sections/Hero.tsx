import React from 'react';
import { ArrowRight, Play } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 pb-12 px-6 md:px-12 bg-[#0A0A0A]">
      <div className="max-w-[1440px] mx-auto w-full flex flex-col items-center text-center">
        {/* Caption */}
        <div
          className="reveal visible mb-6"
          style={{ animationDelay: '0s' }}
        >
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-[0.3em]">
            Overview
          </span>
        </div>

        {/* Main Headline */}
        <h1
          className="reveal visible text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6"
          style={{ animationDelay: '0.1s' }}
        >
          <span className="text-gradient">Project Intelligence</span>
          <br />
          <span className="text-white">项目智能中心</span>
        </h1>

        {/* Subheadline */}
        <p
          className="reveal visible text-lg md:text-xl text-zinc-400 font-light max-w-2xl mb-4"
          style={{ animationDelay: '0.2s' }}
        >
          AI驱动的项目全专业分析平台
        </p>

        {/* Description */}
        <p
          className="reveal visible text-sm md:text-base text-zinc-500 leading-relaxed max-w-xl mb-10"
          style={{ animationDelay: '0.3s' }}
        >
          自动构建建筑、营销、景观、室内、开发和投资维度的专业分析报告，
          将复杂项目信息转化为可执行的战略决策
        </p>

        {/* CTA Buttons */}
        <div
          className="reveal visible flex flex-col sm:flex-row items-center gap-4 mb-16"
          style={{ animationDelay: '0.4s' }}
        >
          <button className="group flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-zinc-200 transition-all duration-200">
            开始分析
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="flex items-center gap-2 border border-zinc-700 text-white px-8 py-3.5 rounded-full text-sm font-medium hover:border-zinc-500 hover:bg-white/5 transition-all duration-200">
            <Play size={16} />
            查看演示
          </button>
        </div>

        {/* Dashboard Preview */}
        <div
          className="reveal visible w-full max-w-5xl"
          style={{ animationDelay: '0.5s' }}
        >
          <div className="relative rounded-xl overflow-hidden border border-[#333333]/60 bg-[#111111] shadow-2xl shadow-black/50">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 via-transparent to-transparent z-10 pointer-events-none" />
            <img
              src="/hero-dashboard.jpg"
              alt="Project Intelligence Dashboard"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
