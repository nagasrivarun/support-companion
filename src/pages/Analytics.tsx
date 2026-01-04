import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Clock,
  ArrowUpRight,
  Package
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

const COLORS = ['hsl(174, 72%, 50%)', 'hsl(142, 72%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)'];

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  totalConversations: number;
  avgResponseTime: number;
  ordersByStatus: { name: string; value: number }[];
  conversationsByStatus: { name: string; value: number }[];
  dailyOrders: { date: string; orders: number; revenue: number }[];
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
    ordersByStatus: [],
    conversationsByStatus: [],
    dailyOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      // Fetch orders
      const { data: orders } = await supabase.from('orders').select('*');
      
      // Fetch conversations
      const { data: conversations } = await supabase.from('conversations').select('*');

      // Calculate metrics
      const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
      
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

      // Generate mock daily data for the chart
      const dailyOrders = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          orders: Math.floor(Math.random() * 20) + 5,
          revenue: Math.floor(Math.random() * 5000) + 1000,
        };
      });

      setData({
        totalOrders: orders?.length || 0,
        totalRevenue,
        totalConversations: conversations?.length || 0,
        avgResponseTime: 2.4,
        ordersByStatus: Object.entries(orderStatusCounts).map(([name, value]) => ({ 
          name: name.charAt(0).toUpperCase() + name.slice(1), 
          value 
        })),
        conversationsByStatus: Object.entries(convStatusCounts).map(([name, value]) => ({ 
          name: name.charAt(0).toUpperCase() + name.slice(1), 
          value 
        })),
        dailyOrders,
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            value={`${data.avgResponseTime}m`}
            change={15}
            icon={Clock}
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
      </div>
    </DashboardLayout>
  );
}
