import React from 'react';

export const ReportCarousel: React.FC = () => {
  const reports = [
    { title: '建筑分析报告', en: 'Architecture Analysis', image: '/report-architecture.jpg' },
    { title: '营销分析报告', en: 'Marketing Analysis', image: '/report-marketing.jpg' },
    { title: '景观分析报告', en: 'Landscape Analysis', image: '/report-landscape.jpg' },
    { title: '室内分析报告', en: 'Interior Analysis', image: '/report-interior.jpg' },
    { title: '开发分析报告', en: 'Development Analysis', image: '/report-development.jpg' },
    { title: '投资分析报告', en: 'Investment Analysis', image: '/report-investment.jpg' },
  ];

  // Duplicate for seamless loop
  const allReports = [...reports, ...reports];

  return (
    <section className="relative py-20 md:py-32 bg-[#0A0A0A] overflow-hidden">
      {/* Section Header */}
      <div className="text-center mb-16 px-6">
        <span className="reveal text-xs font-medium text-zinc-500 uppercase tracking-[0.3em] mb-4 block">
          Comprehensive Reports
        </span>
        <h2 className="reveal text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
          六大专业维度报告
        </h2>
        <p className="reveal text-zinc-400 max-w-2xl mx-auto">
          覆盖建筑、营销、景观、室内、开发和投资分析，生成专业级决策报告
        </p>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10 pointer-events-none" />

        {/* Scrolling Track */}
        <div className="flex animate-marquee hover:[animation-play-state:paused]">
          {allReports.map((report, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[280px] md:w-[320px] mx-3"
            >
              <div className="bg-[#111111] border border-[#333333]/30 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-300 group">
                {/* Report Image */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={report.image}
                    alt={report.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
                </div>
                {/* Report Info */}
                <div className="p-4 -mt-8 relative z-10">
                  <h4 className="text-white font-semibold text-sm mb-0.5">
                    {report.title}
                  </h4>
                  <span className="text-zinc-500 text-xs">{report.en}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 mt-16">
        <div className="reveal grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '30+', label: '页报告页数' },
            { value: '86', label: 'AI评分精度' },
            { value: '6', label: '专业维度' },
            { value: '10min', label: '平均生成时间' },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center py-6 bg-[#1C1C1C] border border-[#333333]/30 rounded-xl"
            >
              <div className="text-2xl md:text-3xl font-bold text-amber-400 mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
