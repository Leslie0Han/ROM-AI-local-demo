import React from 'react';
import { FileBarChart, Layers, Clock } from 'lucide-react';

export const AnalysisFeature: React.FC = () => {
  const stats = [
    { icon: FileBarChart, value: '6', label: '大类专业报告' },
    { icon: Layers, value: '50+', label: '分析维度' },
    { icon: Clock, value: '10', label: '分钟生成' },
  ];

  const features = [
    { num: '01', title: '地块分析', desc: '自动解析红线图、规划条件、区位条件' },
    { num: '02', title: '产品定位', desc: '竞品对标、客群画像、产品策略建议' },
    { num: '03', title: '风险评估', desc: '市场风险、政策风险、成本风险识别' },
    { num: '04', title: '投资测算', desc: '货值测算、利润分析、现金流预测' },
  ];

  return (
    <section className="relative py-20 md:py-32 px-6 md:px-12 bg-[#0A0A0A]">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Image */}
          <div className="reveal relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#333333]/40">
              <img
                src="/workflow-glow.jpg"
                alt="AI Analysis Workflow"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-blue-500/10" />
            </div>
            {/* Floating Labels */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3">
              {features.map((f) => (
                <div
                  key={f.num}
                  className="bg-[#1C1C1C]/90 backdrop-blur-sm border border-[#333333]/60 rounded-lg px-3 py-2 text-xs text-zinc-400"
                >
                  <span className="text-amber-400 font-mono mr-2">{f.num}</span>
                  {f.title}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Content */}
          <div className="reveal">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-[0.2em] mb-4 block">
              AI-Driven Analysis
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-6">
              智能项目分析引擎
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-8">
              基于深度学习的多维度分析算法，自动处理项目任务书、规划条件、红线图、
              竞品资料、销售数据等复杂信息，从地块价值到投资策略，
              为每个专业领域生成精准的分析洞察。
            </p>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              {features.map((f) => (
                <div
                  key={f.num}
                  className="bg-[#1C1C1C] border border-[#333333]/40 rounded-xl p-4 hover:border-amber-500/30 transition-colors duration-300"
                >
                  <span className="text-amber-400 font-mono text-xs">{f.num}</span>
                  <h4 className="text-white font-medium text-sm mt-2 mb-1">{f.title}</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-8 pt-6 border-t border-[#333333]/40">
              {stats.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <s.icon size={20} className="text-amber-400" />
                  <div>
                    <div className="text-white font-bold text-xl">{s.value}</div>
                    <div className="text-zinc-500 text-xs">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
