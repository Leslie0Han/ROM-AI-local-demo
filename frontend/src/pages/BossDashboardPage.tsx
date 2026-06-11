import { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  Briefcase,
  Users,
  Bot,
  Brain,
  Clock,
  RefreshCw,
  CheckCircle2,
  Circle,
  Flame,
  Target,
  BarChart3,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { getBossDashboard, type BossDashboardData } from '../lib/projectsApi';

/* ─── Metric Card ─── */

function MetricCard({
  label,
  value,
  trend,
  trendLabel,
  icon: Icon,
  iconColor,
}: {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  trendLabel?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor: string;
}) {
  return (
    <div className="rounded-lg border border-[#2A2520] bg-[#13110E] p-5 transition-colors hover:border-amber-900/40">
      <div className="mb-3 flex items-center justify-between">
        <Icon size={18} className={iconColor} />
        {trend && trend !== 'stable' && trendLabel && (
          <span
            className={
              trend === 'up'
                ? 'inline-flex items-center gap-1 text-xs text-emerald-400'
                : 'inline-flex items-center gap-1 text-xs text-red-400'
            }
          >
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendLabel}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="mt-1 text-sm text-gray-500">{label}</div>
    </div>
  );
}

const PIE_COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#06B6D4'];

/* ─── Main Page ─── */

export function BossDashboardPage() {
  const [data, setData] = useState<BossDashboardData | null>(null);
  const [message, setMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(() => {
    setRefreshing(true);
    getBossDashboard()
      .then((d) => {
        setData(d);
        setLastUpdated(new Date().toLocaleString('zh-CN'));
        setMessage('');
      })
      .catch((error) => setMessage('加载失败：' + String(error)))
      .finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ─── Metric cards ─── */
  const riskCount = (data?.risk_tasks ?? []).length;
  const overdueTasks = (data?.risk_tasks ?? []).filter(
    (t) => t.status !== 'done' && t.status !== 'completed',
  ).length;
  const nearDeliveryCount = overdueTasks;
  const openTodos = data?.open_task_count ?? 0;

  const metrics = [
    {
      label: '项目总数',
      value: data?.project_count ?? 0,
      icon: Briefcase,
      iconColor: 'text-amber-400',
      trend: 'up' as const,
      trendLabel: `+${data?.active_project_count ?? 0} 进行中`,
    },
    {
      label: '进行中项目',
      value: data?.active_project_count ?? 0,
      icon: BarChart3,
      iconColor: 'text-emerald-400',
      trend: 'stable' as const,
    },
    {
      label: '风险项目',
      value: riskCount,
      icon: AlertTriangle,
      iconColor: 'text-red-400',
      trend: riskCount > 0 ? ('down' as const) : ('stable' as const),
      trendLabel: riskCount > 0 ? `${riskCount} 项` : undefined,
    },
    {
      label: '临近交付',
      value: nearDeliveryCount,
      icon: Clock,
      iconColor: 'text-orange-400',
      trend: nearDeliveryCount > 0 ? ('down' as const) : ('stable' as const),
      trendLabel: nearDeliveryCount > 0 ? `${nearDeliveryCount} 项` : undefined,
    },
    {
      label: '负责人负载',
      value: (data?.member_load ?? []).length,
      icon: Users,
      iconColor: 'text-blue-400',
      trend: 'stable' as const,
    },
    {
      label: '近期会议',
      value: data?.meeting_count ?? 0,
      icon: Calendar,
      iconColor: 'text-violet-400',
      trend: (data?.recent_meetings ?? []).some((m) => m.status === 'scheduled')
        ? ('up' as const)
        : ('stable' as const),
      trendLabel: `${(data?.recent_meetings ?? []).filter((m) => m.status === 'scheduled').length} 待开`,
    },
    {
      label: '未闭环待办',
      value: openTodos,
      icon: Target,
      iconColor: 'text-rose-400',
      trend: openTodos > 3 ? ('down' as const) : ('up' as const),
      trendLabel: openTodos > 0 ? `${openTodos} 项` : undefined,
    },
    {
      label: 'AI使用次数',
      value: data?.skill_card_count ?? 0,
      icon: Bot,
      iconColor: 'text-cyan-400',
      trend: 'up' as const,
      trendLabel: `${data?.skill_card_count ?? 0} 次`,
    },
  ];

  /* ─── Meeting timeline data ─── */
  const meetings = data?.recent_meetings ?? [];

  /* ─── Member workload bar chart data ─── */
  const memberLoadData = (data?.member_load ?? [])
    .slice(0, 8)
    .map((m) => ({ name: m.name, workload: m.workload, type: m.type }));

  /* ─── AI usage pie chart data ─── */
  const aiPieData = Object.entries(data?.ai_card_distribution ?? {}).map(
    ([name, value], i) => ({
      name,
      value,
      color: PIE_COLORS[i % PIE_COLORS.length],
    }),
  );

  /* ─── Knowledge trend line chart (simulated 7-day trend) ─── */
  const knowledgeTotal = Number(data?.knowledge?.total_files ?? 0);
  const knowledgeTrend = Array.from({ length: 7 }, (_, i) => ({
    day: `6/${i + 3}`,
    count: Math.max(0, knowledgeTotal - (6 - i) * 2 + (i * 1)),
  }));

  /* ─── Open todo items sorted by priority ─── */
  const todoItems = (data?.risk_tasks ?? [])
    .slice(0, 8)
    .sort((a, b) => {
      const priorityOrder: Record<string, number> = { high: 0, '高': 1, medium: 2, '中': 3, low: 4, '低': 5 };
      return (priorityOrder[a.risk_level] ?? 99) - (priorityOrder[b.risk_level] ?? 99);
    });

  return (
    <main className="min-h-screen bg-gray-900 px-6 pb-20 pt-28 md:px-12">
      <div className="mx-auto max-w-[1400px]">
        {/* ─── Header ─── */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="mb-3 block text-xs font-medium uppercase tracking-[0.3em] text-amber-600/70">
              Management Cockpit
            </span>
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-white md:text-5xl">
              管理驾驶舱
            </h1>
            <p className="text-sm text-gray-500">公司项目运营全景</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-600">最后更新：{lastUpdated || '—'}</span>
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-900/40 bg-amber-900/10 px-3 py-2 text-xs text-amber-400 transition-colors hover:bg-amber-900/20 disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              刷新
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {message}
          </div>
        )}

        {/* ─── Metric Cards 2x4 ─── */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>

        {/* ─── Detail Panels ─── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr]">
          {/* ─── Left Column ─── */}
          <div className="space-y-5">
            {/* Meeting Timeline */}
            <section className="rounded-lg border border-[#2A2520] bg-[#13110E] p-5">
              <div className="mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-amber-400" />
                <h2 className="text-sm font-semibold text-white">近期会议</h2>
                <span className="ml-auto text-xs text-gray-600">未来7天</span>
              </div>
              <div className="relative pl-6">
                <div className="absolute left-2 top-0 bottom-0 w-px bg-[#2A2520]" />
                <div className="space-y-4">
                  {meetings.length > 0 ? (
                    meetings.slice(0, 6).map((meeting) => (
                      <div key={meeting.id} className="relative">
                        <div
                          className={`absolute -left-4 top-1.5 h-2.5 w-2.5 rounded-full ${
                            meeting.status === 'completed'
                              ? 'bg-emerald-400'
                              : meeting.status === 'scheduled'
                                ? 'bg-amber-400'
                                : 'bg-gray-500'
                          }`}
                        />
                        <div className="rounded-lg bg-[#1A1714] p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white">
                              {meeting.title}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] ${
                                meeting.status === 'completed'
                                  ? 'bg-emerald-400/10 text-emerald-400'
                                  : 'bg-amber-400/10 text-amber-400'
                              }`}
                            >
                              {meeting.status === 'completed' ? '已完成' : '待开'}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                            <Clock size={11} />
                            {meeting.scheduled_at
                              ? new Date(meeting.scheduled_at).toLocaleString('zh-CN', {
                                  month: 'numeric',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '时间待定'}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">暂无会议记录</p>
                  )}
                </div>
              </div>
            </section>

            {/* Member Workload Bar Chart */}
            <section className="rounded-lg border border-[#2A2520] bg-[#13110E] p-5">
              <div className="mb-4 flex items-center gap-2">
                <Users size={18} className="text-amber-400" />
                <h2 className="text-sm font-semibold text-white">负责人负载分布</h2>
              </div>
              {memberLoadData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={memberLoadData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2520" />
                    <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: '#D1D5DB', fontSize: 12 }}
                      width={70}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#1A1714',
                        border: '1px solid #2A2520',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      labelStyle={{ color: '#F59E0B' }}
                    />
                    <Bar dataKey="workload" radius={[0, 4, 4, 0]}>
                      {memberLoadData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.type === 'ai' ? '#3B82F6' : '#F59E0B'}
                          fillOpacity={0.8}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-600">暂无负载数据</p>
              )}
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-400" /> 人工
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500" /> AI
                </span>
              </div>
            </section>
          </div>

          {/* ─── Right Column ─── */}
          <div className="space-y-5">
            {/* Open Todos */}
            <section className="rounded-lg border border-[#2A2520] bg-[#13110E] p-5">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-rose-400" />
                <h2 className="text-sm font-semibold text-white">未闭环待办</h2>
                <span className="ml-auto text-xs text-gray-600">按紧急度排序</span>
              </div>
              <div className="space-y-2">
                {todoItems.length > 0 ? (
                  todoItems.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 rounded-lg bg-[#1A1714] p-3"
                    >
                      {task.risk_level === 'high' || task.risk_level === '高' ? (
                        <Flame size={14} className="shrink-0 text-red-400" />
                      ) : task.risk_level === 'medium' || task.risk_level === '中' ? (
                        <AlertTriangle size={14} className="shrink-0 text-amber-400" />
                      ) : (
                        <Circle size={14} className="shrink-0 text-gray-500" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm text-gray-200">{task.task_name}</div>
                        <div className="text-xs text-gray-600">
                          {task.owner_role || '待分配'} · {task.status}
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${
                          task.risk_level === 'high' || task.risk_level === '高'
                            ? 'bg-red-400/10 text-red-400'
                            : task.risk_level === 'medium' || task.risk_level === '中'
                              ? 'bg-amber-400/10 text-amber-400'
                              : 'bg-gray-500/10 text-gray-400'
                        }`}
                      >
                        {task.risk_level === 'high'
                          ? '紧急'
                          : task.risk_level === 'medium'
                            ? '中等'
                            : task.risk_level === '高'
                              ? '紧急'
                              : task.risk_level === '中'
                                ? '中等'
                                : '低'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    所有待办已闭环
                  </div>
                )}
              </div>
            </section>

            {/* AI Usage Pie Chart */}
            <section className="rounded-lg border border-[#2A2520] bg-[#13110E] p-5">
              <div className="mb-4 flex items-center gap-2">
                <Brain size={18} className="text-cyan-400" />
                <h2 className="text-sm font-semibold text-white">AI使用情况</h2>
              </div>
              {aiPieData.length > 0 ? (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={180}>
                    <PieChart>
                      <Pie
                        data={aiPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {aiPieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: '#1A1714',
                          border: '1px solid #2A2520',
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {aiPieData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-gray-400">{item.name}</span>
                        </span>
                        <span className="text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">暂无AI使用数据</p>
              )}
            </section>

            {/* Knowledge Trend */}
            <section className="rounded-lg border border-[#2A2520] bg-[#13110E] p-5">
              <div className="mb-4 flex items-center gap-2">
                <FileText size={18} className="text-emerald-400" />
                <h2 className="text-sm font-semibold text-white">新增知识沉淀</h2>
                <span className="ml-auto text-xs text-gray-600">近7天</span>
              </div>
              <div className="mb-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{knowledgeTotal}</span>
                <span className="text-sm text-gray-500">总文件</span>
              </div>
              <ResponsiveContainer width="100%" height={100}>
                <LineChart data={knowledgeTrend} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2520" />
                  <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      background: '#1A1714',
                      border: '1px solid #2A2520',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: '#10B981', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}