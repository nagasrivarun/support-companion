import { useEffect, useState } from 'react';
import { 
  Package, 
  MessageSquare, 
  TrendingUp, 
  Users,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  trend: 'up' | 'down';
}

function StatCard({ title, value, change, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="glass rounded-xl p-6 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
          <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-success' : 'text-destructive'}`}>
            {trend === 'up' ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            <span>{Math.abs(change)}% from last week</span>
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    orders: 0,
    conversations: 0,
    revenue: 0,
    customers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [ordersResult, conversationsResult] = await Promise.all([
        supabase.from('orders').select('id, total_amount', { count: 'exact' }),
        supabase.from('conversations').select('id', { count: 'exact' }),
      ]);

      const totalRevenue = ordersResult.data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      
      setStats({
        orders: ordersResult.count || 0,
        conversations: conversationsResult.count || 0,
        revenue: totalRevenue,
        customers: new Set(ordersResult.data?.map(o => o.id)).size || 0,
      });
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <SEO title="Admin Dashboard · Shop India" description="Internal admin dashboard for Shop India staff." path="/dashboard" noIndex />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your support system.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Orders"
            value={stats.orders}
            change={12}
            icon={Package}
            trend="up"
          />
          <StatCard
            title="Active Conversations"
            value={stats.conversations}
            change={8}
            icon={MessageSquare}
            trend="up"
          />
          <StatCard
            title="Revenue"
            value={`$${stats.revenue.toLocaleString()}`}
            change={23}
            icon={TrendingUp}
            trend="up"
          />
          <StatCard
            title="Customers"
            value={stats.customers}
            change={5}
            icon={Users}
            trend="up"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">New conversation started</p>
                    <p className="text-xs text-muted-foreground">{i} hour{i > 1 ? 's' : ''} ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">System Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <span className="text-sm text-foreground">Chatbot Status</span>
                <span className="flex items-center gap-2 text-success text-sm">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <span className="text-sm text-foreground">Database</span>
                <span className="flex items-center gap-2 text-success text-sm">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <span className="text-sm text-foreground">Live Chat Queue</span>
                <span className="text-sm text-muted-foreground">0 waiting</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
