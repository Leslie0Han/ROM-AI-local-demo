import React from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  AreaChart, Area, ResponsiveContainer,
} from 'recharts';
import { Star, TrendingUp, Shield, Lightbulb } from 'lucide-react';

const radarData = [
  { subject: '开发价值', A: 85, fullMark: 100 },
  { subject: '销售潜力', A: 95, fullMark: 100 },
  { subject: '设计创新', A: 90, fullMark: 100 },
  { subject: '风险控制', A: 65, fullMark: 100 },
  { subject: '景观价值', A: 80, fullMark: 100 },
  { subject: '投资回报', A: 88, fullMark: 100 },
];

const barData = [
  { name: '高层', value: 42000 },
  { name: '洋房', value: 28000 },
  { name: '商业', value: 15000 },
  { name: '车位', value: 8000 },
];

const areaData = [
  { month: '1月', value: 12 },
  { month: '3月', value: 28 },
  { month: '5月', value: 45 },
  { month: '7月', value: 62 },
  { month: '9月', value: 78 },
  { month: '11月', value: 85 },
  { month: '12月', value: 92 },
];

export const DashboardDemo: React.FC = () => {
  const scores = [
    { label: 'AI评分', value: '86', icon: Star, color: 'text-amber-400' },
    { label: '开发价值', value: '4.2', icon: TrendingUp, color: 'text-emerald-400' },
    { label: '销售潜力', value: '4.8', icon: TrendingUp, color: 'text-blue-400' },
    { label: '设计创新', value: '4.5', icon: Lightbulb, color: 'text-purple-400' },
    { label: '风险指数', value: '3.0', icon: Shield, color: 'text-red-400' },
  ];

  return (
    <section className="relative py-20 md:py-32 px-6 md:px-12 bg-radial-glow">
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="reveal text-xs font-medium text-zinc-500 uppercase tracking-[0.3em] mb-4 block">
            Project Cockpit
          </span>
          <h2 className="reveal text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            项目驾驶舱
          </h2>
          <p className="reveal text-zinc-400 max-w-2xl mx-auto">
            一目了然的AI项目评分与多维度分析仪表盘
          </p>
        </div>

        {/* Demo Project Card */}
        <div className="reveal bg-[#111111] border border-[#333333]/40 rounded-2xl overflow-hidden">
          {/* Project Header */}
          <div className="p-6 md:p-8 border-b border-[#333333]/40">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                  石家庄庄项目
                </h3>
                <p className="text-sm text-zinc-500">
                  河北省石家庄市 · 住宅用地 · 12.5万m²
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-medium">
                  分析完成
                </span>
                <span className="text-zinc-500 text-xs">
                  生成时间: 8分32秒
                </span>
              </div>
            </div>
          </div>

          {/* Score Cards */}
          <div className="p-6 md:p-8 border-b border-[#333333]/40">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {scores.map((s, i) => (
                <div
                  key={i}
                  className="bg-[#1C1C1C] border border-[#333333]/30 rounded-xl p-4 text-center"
                >
                  <s.icon size={20} className={`${s.color} mx-auto mb-2`} />
                  <div className="text-2xl font-bold text-white mb-0.5">
                    {s.value}
                  </div>
                  <div className="text-xs text-zinc-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts Grid */}
          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Radar Chart */}
            <div className="bg-[#1C1C1C] border border-[#333333]/30 rounded-xl p-4">
              <h4 className="text-sm font-medium text-white mb-4">综合评估雷达</h4>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#333333" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: '#a1a1aa', fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: '#52525b', fontSize: 10 }}
                  />
                  <Radar
                    name="评分"
                    dataKey="A"
                    stroke="#fbbf24"
                    fill="#fbbf24"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="bg-[#1C1C1C] border border-[#333333]/30 rounded-xl p-4">
              <h4 className="text-sm font-medium text-white mb-4">货值结构 (万元)</h4>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#a1a1aa', fontSize: 11 }}
                    axisLine={{ stroke: '#333333' }}
                  />
                  <YAxis
                    tick={{ fill: '#52525b', fontSize: 10 }}
                    axisLine={{ stroke: '#333333' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1C1C1C',
                      border: '1px solid #333333',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="value" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Area Chart */}
            <div className="bg-[#1C1C1C] border border-[#333333]/30 rounded-xl p-4">
              <h4 className="text-sm font-medium text-white mb-4">去化进度预测 (%)</h4>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#a1a1aa', fontSize: 11 }}
                    axisLine={{ stroke: '#333333' }}
                  />
                  <YAxis
                    tick={{ fill: '#52525b', fontSize: 10 }}
                    axisLine={{ stroke: '#333333' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1C1C1C',
                      border: '1px solid #333333',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#a78bfa"
                    fill="url(#areaGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
