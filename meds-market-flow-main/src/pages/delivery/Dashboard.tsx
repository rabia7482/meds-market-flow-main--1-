import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Truck, MapPin, Package, User, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Delivery {
  id: string;
  order_id: string;
  pharmacy_id: string;
  status_delivery: 'pending' | 'in-transit' | 'delivered';
  confirmed_by_admin: boolean;
  confirmed_by_pharmacy: boolean;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
  order?: {
    id: string;
    total_amount: number;
    customer_name?: string;
  };
  pharmacy?: {
    name: string;
    address: string;
    city: string;
    state: string;
  };
}

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDeliveries();
    }
  }, [user]);

  const fetchDeliveries = async () => {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select(`
          *,
          pharmacy:pharmacies(name, address, city, state),
          order:orders(id, total_amount)
        `)
        .eq('delivery_agent_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch customer names
      const customerIds = data?.map(d => (d.order as any)?.customer_id).filter(Boolean) || [];

      const { data: customers } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', customerIds);

      const transformedDeliveries = data?.map(delivery => ({
        ...delivery,
        order: delivery.order ? {
          ...delivery.order,
          customer_name: customers?.find(c => c.user_id === (delivery.order as any).customer_id)?.full_name
        } : undefined
      })) || [];

      setDeliveries(transformedDeliveries);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast({
        title: "Error",
        description: "Failed to load deliveries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateDeliveryStatus = async (deliveryId: string, status: 'pending' | 'in-transit' | 'delivered') => {
    try {
      const updateData: any = { status_delivery: status };
      if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('deliveries')
        .update(updateData)
        .eq('id', deliveryId);

      if (error) throw error;

      setDeliveries(prev =>
        prev.map(d =>
          d.id === deliveryId
            ? { ...d, status_delivery: status, delivered_at: status === 'delivered' ? new Date().toISOString() : d.delivered_at }
            : d
        )
      );

      toast({
        title: "Success",
        description: `Delivery status updated to ${status}`,
      });
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast({
        title: "Error",
        description: "Failed to update delivery status",
        variant: "destructive",
      });
    }
  };

  const confirmDelivery = async (deliveryId: string) => {
    try {
      const { error } = await supabase
        .from('deliveries')
        .update({ confirmed_by_pharmacy: true })
        .eq('id', deliveryId);

      if (error) throw error;

      setDeliveries(prev =>
        prev.map(d =>
          d.id === deliveryId
            ? { ...d, confirmed_by_pharmacy: true }
            : d
        )
      );

      toast({
        title: "Success",
        description: "Delivery confirmed",
      });
    } catch (error) {
      console.error('Error confirming delivery:', error);
      toast({
        title: "Error",
        description: "Failed to confirm delivery",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-transit': 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800'
    };

    return (
      <Badge
        variant="secondary"
        className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}
      >
        {status.replace('-', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getStatusStats = () => {
    const stats = {
      pending: deliveries.filter(d => d.status_delivery === 'pending').length,
      'in-transit': deliveries.filter(d => d.status_delivery === 'in-transit').length,
      delivered: deliveries.filter(d => d.status_delivery === 'delivered').length,
    };
    return stats;
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <DashboardLayout requiredRole="delivery_agent">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading deliveries...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="delivery_agent">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Delivery Dashboard</h1>
          <p className="text-muted-foreground">Manage your assigned deliveries</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Deliveries</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats['in-transit']}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            </CardContent>
          </Card>
        </div>

        {/* Deliveries List */}
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <Card key={delivery.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">Delivery #{delivery.id.slice(0, 8)}</h3>
                        {getStatusBadge(delivery.status_delivery)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-start gap-2">
                          <Package className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Order #{delivery.order?.id.slice(0, 8)}</p>
                            <p className="text-muted-foreground">₦{delivery.order?.total_amount.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Customer</p>
                            <p className="text-muted-foreground">{delivery.order?.customer_name || 'Unknown'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 md:col-span-2">
                          <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{delivery.pharmacy?.name}</p>
                            <p className="text-muted-foreground">
                              {delivery.pharmacy?.address}, {delivery.pharmacy?.city}, {delivery.pharmacy?.state}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Confirmation Status */}
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span>Admin Confirmed:</span>
                      {delivery.confirmed_by_admin ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Pharmacy Confirmed:</span>
                      {delivery.confirmed_by_pharmacy ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    {delivery.status_delivery === 'pending' && (
                      <Button
                        onClick={() => updateDeliveryStatus(delivery.id, 'in-transit')}
                        className="flex items-center gap-2"
                      >
                        <Truck className="h-4 w-4" />
                        Start Delivery
                      </Button>
                    )}

                    {delivery.status_delivery === 'in-transit' && (
                      <>
                        <Button
                          onClick={() => updateDeliveryStatus(delivery.id, 'delivered')}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Mark Delivered
                        </Button>
                        {!delivery.confirmed_by_pharmacy && (
                          <Button
                            onClick={() => confirmDelivery(delivery.id)}
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Confirm Pickup
                          </Button>
                        )}
                      </>
                    )}

                    {delivery.status_delivery === 'delivered' && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">Delivery Completed</span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Created: {new Date(delivery.created_at).toLocaleDateString()}
                    {delivery.delivered_at && (
                      <> | Delivered: {new Date(delivery.delivered_at).toLocaleDateString()}</>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {deliveries.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Deliveries Assigned</h3>
                <p className="text-muted-foreground">You don't have any deliveries assigned yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DeliveryDashboard;
