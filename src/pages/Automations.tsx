import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Bell, 
  MessageSquare, 
  ShoppingCart, 
  Star, 
  Package,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Loader2,
  Save,
  Play
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAutomation } from '@/hooks/useAutomation';

interface Webhook {
  id: string;
  webhook_type: string;
  webhook_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AutomationLog {
  id: string;
  event_type: string;
  status: string;
  created_at: string;
  error_message: string | null;
}

const WEBHOOK_TYPES = [
  {
    type: 'order_notification',
    title: 'Order Notifications',
    description: 'Send AI-powered order confirmations and shipping updates to customers',
    icon: Package,
  },
  {
    type: 'customer_support',
    title: 'Customer Support',
    description: 'Route support requests to AI agents for instant responses',
    icon: MessageSquare,
  },
  {
    type: 'abandoned_cart',
    title: 'Abandoned Cart Recovery',
    description: 'AI-generated recovery emails for abandoned shopping carts',
    icon: ShoppingCart,
  },
  {
    type: 'product_recommendation',
    title: 'Product Recommendations',
    description: 'AI-powered personalized product suggestions',
    icon: Zap,
  },
  {
    type: 'review_request',
    title: 'Review Requests',
    description: 'Automated review requests after order delivery',
    icon: Star,
  },
];

export default function Automations() {
  const [webhooks, setWebhooks] = useState<Record<string, Webhook>>({});
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, { url: string; active: boolean }>>({});
  const { toast } = useToast();
  const {
    triggerOrderNotification,
    triggerAbandonedCartRecovery,
    triggerProductRecommendation,
    triggerReviewRequest,
    triggerCustomerSupport,
  } = useAutomation();

  useEffect(() => {
    fetchWebhooks();
    fetchLogs();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from('automation_webhooks')
        .select('*');

      if (error) throw error;

      const webhookMap: Record<string, Webhook> = {};
      const formDataMap: Record<string, { url: string; active: boolean }> = {};
      
      data?.forEach((w: Webhook) => {
        webhookMap[w.webhook_type] = w;
        formDataMap[w.webhook_type] = { url: w.webhook_url, active: w.is_active };
      });

      // Initialize form data for all webhook types
      WEBHOOK_TYPES.forEach(({ type }) => {
        if (!formDataMap[type]) {
          formDataMap[type] = { url: '', active: false };
        }
      });

      setWebhooks(webhookMap);
      setFormData(formDataMap);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load webhook configurations',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('automation_logs')
        .select('id, event_type, status, created_at, error_message')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const saveWebhook = async (type: string) => {
    setSaving(type);
    const data = formData[type];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const existing = webhooks[type];

      if (existing) {
        const { error } = await supabase
          .from('automation_webhooks')
          .update({
            webhook_url: data.url,
            is_active: data.active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('automation_webhooks')
          .insert({
            user_id: user.id,
            webhook_type: type,
            webhook_url: data.url,
            is_active: data.active,
          });

        if (error) throw error;
      }

      toast({
        title: 'Saved',
        description: 'Webhook configuration updated successfully',
      });

      fetchWebhooks();
    } catch (error) {
      console.error('Error saving webhook:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save webhook configuration',
      });
    } finally {
      setSaving(null);
    }
  };

  const updateFormData = (type: string, field: 'url' | 'active', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-affirmative" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const testAutomation = async (type: string) => {
    if (!formData[type]?.active || !formData[type]?.url) {
      toast({
        variant: 'destructive',
        title: 'Cannot Test',
        description: 'Please save and activate the webhook before testing',
      });
      return;
    }

    setTesting(type);
    let success = false;

    try {
      switch (type) {
        case 'order_notification':
          success = await triggerOrderNotification({
            orderNumber: 'TEST-' + Date.now(),
            customerName: 'Test Customer',
            customerEmail: 'test@example.com',
            totalAmount: 99.99,
            items: [{ name: 'Test Product', quantity: 1, price: 99.99 }],
            shippingAddress: '123 Test Street, Test City, TC 12345',
          });
          break;
        case 'customer_support':
          success = await triggerCustomerSupport({
            customerEmail: 'test@example.com',
            customerName: 'Test Customer',
            message: 'This is a test support request from the automation dashboard.',
            category: 'general',
          });
          break;
        case 'abandoned_cart':
          success = await triggerAbandonedCartRecovery({
            customerEmail: 'test@example.com',
            items: [
              { productId: 'test-1', title: 'Test Product', price: 49.99, quantity: 2 },
            ],
            totalAmount: 99.98,
            cartUrl: window.location.origin + '/shop',
          });
          break;
        case 'product_recommendation':
          success = await triggerProductRecommendation({
            customerEmail: 'test@example.com',
            recentPurchases: [{ productId: 'prod-1', title: 'Previous Purchase' }],
            viewedProducts: [{ productId: 'prod-2', title: 'Viewed Item' }],
            preferences: ['electronics', 'fashion'],
          });
          break;
        case 'review_request':
          success = await triggerReviewRequest({
            customerEmail: 'test@example.com',
            customerName: 'Test Customer',
            orderNumber: 'ORD-12345',
            products: [{ productId: 'prod-1', title: 'Test Product', handle: 'test-product' }],
            orderDate: new Date().toISOString(),
          });
          break;
      }

      toast({
        title: success ? 'Test Sent' : 'Test Failed',
        description: success 
          ? 'Test payload sent to webhook successfully' 
          : 'Webhook not configured or failed to respond',
        variant: success ? 'default' : 'destructive',
      });

      // Refresh logs after test
      setTimeout(fetchLogs, 1000);
    } catch (error) {
      console.error('Test error:', error);
      toast({
        variant: 'destructive',
        title: 'Test Failed',
        description: 'An error occurred while testing the automation',
      });
    } finally {
      setTesting(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            AI Automations
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure Make.com webhooks to power AI-driven customer experiences
          </p>
        </div>

        <Tabs defaultValue="webhooks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="webhooks">Webhook Configuration</TabsTrigger>
            <TabsTrigger value="logs">Automation Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="webhooks" className="space-y-4">
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <ExternalLink className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">How to set up Make.com webhooks</h3>
                    <ol className="text-sm text-muted-foreground mt-2 space-y-1 list-decimal list-inside">
                      <li>Go to your Make.com dashboard and create a new scenario</li>
                      <li>Add a "Webhook" trigger module and copy the webhook URL</li>
                      <li>Paste the URL below and add your AI processing modules</li>
                      <li>Connect email, SMS, or other notification modules</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {WEBHOOK_TYPES.map(({ type, title, description, icon: Icon }) => (
                <Card key={type}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{title}</CardTitle>
                          <CardDescription>{description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={formData[type]?.active || false}
                          onCheckedChange={(checked) => updateFormData(type, 'active', checked)}
                        />
                        <Badge variant={formData[type]?.active ? 'default' : 'secondary'}>
                          {formData[type]?.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Label htmlFor={`url-${type}`} className="sr-only">
                          Webhook URL
                        </Label>
                        <Input
                          id={`url-${type}`}
                          placeholder="https://hook.make.com/..."
                          value={formData[type]?.url || ''}
                          onChange={(e) => updateFormData(type, 'url', e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={() => saveWebhook(type)}
                        disabled={saving === type || !formData[type]?.url}
                      >
                        {saving === type ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        <span className="ml-2">Save</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => testAutomation(type)}
                        disabled={testing === type || !formData[type]?.active || !formData[type]?.url}
                      >
                        {testing === type ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                        <span className="ml-2">Test</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Recent Automation Activity</CardTitle>
                <CardDescription>
                  View the history of triggered automations and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {logs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No automation logs yet</p>
                    <p className="text-sm">Logs will appear here when automations are triggered</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(log.status)}
                          <div>
                            <p className="font-medium text-sm">
                              {log.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                            {log.error_message && (
                              <p className="text-xs text-destructive">{log.error_message}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              log.status === 'success' ? 'default' :
                              log.status === 'failed' ? 'destructive' : 'secondary'
                            }
                          >
                            {log.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
