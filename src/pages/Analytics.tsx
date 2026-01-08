import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  MessageSquare, 
  Clock,
  ArrowUpRight,
  Package,
  Star,
  CheckCircle,
  Users
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['hsl(174, 72%, 50%)', 'hsl(142, 72%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)', 'hsl(262, 72%, 55%)'];

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  totalConversations: number;
  avgResponseTime: number;
  avgSatisfactionRating: number;
  resolutionRate: number;
  ordersByStatus: { name: string; value: number }[];
  conversationsByStatus: { name: string; value: number }[];
  dailyOrders: { date: string; orders: number; revenue: number }[];
  agentPerformance: { name: string; conversations: number; avgResponseTime: number; rating: number }[];
  ratingDistribution: { rating: number; count: number }[];
}

function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon 
}: { 
  title: string; 
  value: string | number; 
  change: number; 
  icon: React.ElementType;
}) {
  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          <div className="flex items-center gap-1 mt-2 text-sm text-success">
            <ArrowUpRight className="h-4 w-4" />
            <span>{change}% vs last period</span>
          </div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData>({
    totalOrders: 0,
    totalRevenue: 0,
    totalConversations: 0,
    avgResponseTime: 0,
    avgSatisfactionRating: 0,
    resolutionRate: 0,
    ordersByStatus: [],
    conversationsByStatus: [],
    dailyOrders: [],
    agentPerformance: [],
    ratingDistribution: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      // Fetch orders
      const { data: orders } = await supabase.from('orders').select('*');
      
      // Fetch conversations
      const { data: conversations } = await supabase.from('conversations').select('*');

      // Fetch satisfaction ratings
      const { data: ratings } = await supabase.from('satisfaction_ratings').select('*');

      // Fetch profiles for agent names
      const { data: profiles } = await supabase.from('profiles').select('*');

      // Calculate metrics
      const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
      
      // Calculate average satisfaction rating
      const avgSatisfactionRating = ratings?.length 
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
        : 0;

      // Calculate resolution rate
      const resolvedCount = conversations?.filter(c => c.status === 'resolved').length || 0;
      const resolutionRate = conversations?.length 
        ? (resolvedCount / conversations.length) * 100 
        : 0;

      // Calculate average response time (from created_at to first_response_at)
      const responseTimes = conversations
        ?.filter(c => c.first_response_at && c.created_at)
        .map(c => {
          const created = new Date(c.created_at!).getTime();
          const responded = new Date(c.first_response_at!).getTime();
          return (responded - created) / 60000; // Convert to minutes
        });
      const avgResponseTime = responseTimes?.length 
        ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length 
        : 0;

      // Orders by status
      const orderStatusCounts: Record<string, number> = {};
      orders?.forEach(o => {
        orderStatusCounts[o.status || 'pending'] = (orderStatusCounts[o.status || 'pending'] || 0) + 1;
      });

      // Conversations by status
      const convStatusCounts: Record<string, number> = {};
      conversations?.forEach(c => {
        convStatusCounts[c.status || 'bot'] = (convStatusCounts[c.status || 'bot'] || 0) + 1;
      });

      // Agent performance
      const agentStats: Record<string, { conversations: number; totalResponseTime: number; totalRating: number; ratingCount: number }> = {};
      conversations?.filter(c => c.assigned_agent_id).forEach(c => {
        const agentId = c.assigned_agent_id!;
        if (!agentStats[agentId]) {
          agentStats[agentId] = { conversations: 0, totalResponseTime: 0, totalRating: 0, ratingCount: 0 };
        }
        agentStats[agentId].conversations++;
        if (c.first_response_at && c.created_at) {
          const responseTime = (new Date(c.first_response_at).getTime() - new Date(c.created_at).getTime()) / 60000;
          agentStats[agentId].totalResponseTime += responseTime;
        }
      });

      // Add ratings to agent stats
      const conversationToAgent = new Map(conversations?.map(c => [c.id, c.assigned_agent_id]) || []);
      ratings?.forEach(r => {
        const agentId = conversationToAgent.get(r.conversation_id);
        if (agentId && agentStats[agentId]) {
          agentStats[agentId].totalRating += r.rating;
          agentStats[agentId].ratingCount++;
        }
      });

      const agentPerformance = Object.entries(agentStats).map(([agentId, stats]) => {
        const profile = profiles?.find(p => p.user_id === agentId);
        return {
          name: profile?.full_name || profile?.email || 'Unknown Agent',
          conversations: stats.conversations,
          avgResponseTime: stats.conversations > 0 ? stats.totalResponseTime / stats.conversations : 0,
          rating: stats.ratingCount > 0 ? stats.totalRating / stats.ratingCount : 0,
        };
      });

      // Rating distribution
      const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratings?.forEach(r => {
        ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
      });
      const ratingDistribution = Object.entries(ratingCounts).map(([rating, count]) => ({
        rating: parseInt(rating),
        count,
      }));

      // Generate daily data for the chart based on actual orders
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date;
      });

      const dailyOrders = last7Days.map(date => {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        
        const dayOrders = orders?.filter(o => {
          const orderDate = new Date(o.created_at!);
          return orderDate >= dayStart && orderDate <= dayEnd;
        }) || [];

        return {
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          orders: dayOrders.length,
          revenue: dayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0),
        };
      });

      setData({
        totalOrders: orders?.length || 0,
        totalRevenue,
        totalConversations: conversations?.length || 0,
        avgResponseTime,
        avgSatisfactionRating,
        resolutionRate,
        ordersByStatus: Object.entries(orderStatusCounts).map(([name, value]) => ({ 
          name: name.charAt(0).toUpperCase() + name.slice(1), 
          value 
        })),
        conversationsByStatus: Object.entries(convStatusCounts).map(([name, value]) => ({ 
          name: name.charAt(0).toUpperCase() + name.slice(1), 
          value 
        })),
        dailyOrders,
        agentPerformance,
        ratingDistribution,
      });

      setLoading(false);
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Loading analytics...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Track your support system performance</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <MetricCard
            title="Total Orders"
            value={data.totalOrders}
            change={12}
            icon={Package}
          />
          <MetricCard
            title="Revenue"
            value={`$${data.totalRevenue.toLocaleString()}`}
            change={23}
            icon={TrendingUp}
          />
          <MetricCard
            title="Conversations"
            value={data.totalConversations}
            change={8}
            icon={MessageSquare}
          />
          <MetricCard
            title="Avg Response Time"
            value={`${data.avgResponseTime.toFixed(1)}m`}
            change={15}
            icon={Clock}
          />
          <MetricCard
            title="Satisfaction"
            value={data.avgSatisfactionRating ? `${data.avgSatisfactionRating.toFixed(1)} ★` : 'N/A'}
            change={5}
            icon={Star}
          />
          <MetricCard
            title="Resolution Rate"
            value={`${data.resolutionRate.toFixed(0)}%`}
            change={10}
            icon={CheckCircle}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders Trend */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Orders Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.dailyOrders}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(215, 20%, 55%)" 
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(222, 47%, 10%)', 
                      border: '1px solid hsl(222, 30%, 18%)',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="hsl(174, 72%, 50%)" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(174, 72%, 50%)', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Daily Revenue</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dailyOrders}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(215, 20%, 55%)" 
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(222, 47%, 10%)', 
                      border: '1px solid hsl(222, 30%, 18%)',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`$${value}`, 'Revenue']}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="hsl(174, 72%, 50%)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Pie Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders by Status */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Orders by Status</h3>
            <div className="h-64 flex items-center justify-center">
              {data.ordersByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.ordersByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.ordersByStatus.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(222, 47%, 10%)', 
                        border: '1px solid hsl(222, 30%, 18%)',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground">No order data</p>
              )}
            </div>
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              {data.ordersByStatus.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Conversations by Status */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Conversations by Status</h3>
            <div className="h-64 flex items-center justify-center">
              {data.conversationsByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.conversationsByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.conversationsByStatus.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(222, 47%, 10%)', 
                        border: '1px solid hsl(222, 30%, 18%)',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground">No conversation data</p>
              )}
            </div>
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              {data.conversationsByStatus.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agent Performance & Satisfaction */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agent Performance Table */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Agent Performance
            </h3>
            <div className="overflow-x-auto">
              {data.agentPerformance.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-medium">Agent</th>
                      <th className="text-center py-2 text-muted-foreground font-medium">Conversations</th>
                      <th className="text-center py-2 text-muted-foreground font-medium">Avg Response</th>
                      <th className="text-center py-2 text-muted-foreground font-medium">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.agentPerformance.map((agent, idx) => (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="py-3 text-foreground">{agent.name}</td>
                        <td className="py-3 text-center text-foreground">{agent.conversations}</td>
                        <td className="py-3 text-center text-foreground">{agent.avgResponseTime.toFixed(1)}m</td>
                        <td className="py-3 text-center">
                          {agent.rating > 0 ? (
                            <span className="text-yellow-400">{agent.rating.toFixed(1)} ★</span>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted-foreground text-center py-8">No agent data available</p>
              )}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Satisfaction Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.ratingDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" horizontal={false} />
                  <XAxis type="number" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                  <YAxis 
                    type="category" 
                    dataKey="rating" 
                    stroke="hsl(215, 20%, 55%)" 
                    fontSize={12}
                    tickFormatter={(value) => `${value} ★`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(222, 47%, 10%)', 
                      border: '1px solid hsl(222, 30%, 18%)',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [value, 'Responses']}
                    labelFormatter={(label) => `${label} Star${label === 1 ? '' : 's'}`}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(38, 92%, 50%)" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
