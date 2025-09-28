import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Truck, Search, CheckCircle, XCircle, User, Store, Package } from 'lucide-react';

interface Delivery {
  id: string;
  order_id: string;
  pharmacy_id: string;
  delivery_agent_id: string;
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
  };
  delivery_agent?: {
    full_name?: string;
  };
}

const AdminDeliveries = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const pharmacyFilter = searchParams.get('pharmacy');

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select(`
          *,
          pharmacy:pharmacies(name),
          order:orders(id, total_amount)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch delivery agents and customer names
      const agentIds = data?.map(d => d.delivery_agent_id).filter(Boolean) || [];
      const customerIds = data?.map(d => (d.order as any)?.customer_id).filter(Boolean) || [];

      const [agentsResponse, customersResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', agentIds),
        supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', customerIds)
      ]);

      const agents = agentsResponse.data || [];
      const customers = customersResponse.data || [];

      const transformedDeliveries = data?.map(delivery => ({
        ...delivery,
        delivery_agent: agents.find(a => a.user_id === delivery.delivery_agent_id),
        order: delivery.order ? {
          ...delivery.order,
          customer_name: customers.find(c => c.user_id === (delivery.order as any).customer_id)?.full_name
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

  const confirmDelivery = async (deliveryId: string, type: 'admin' | 'pharmacy') => {
    try {
      const updateData = type === 'admin'
        ? { confirmed_by_admin: true }
        : { confirmed_by_pharmacy: true };

      const { error } = await supabase
        .from('deliveries')
        .update(updateData)
        .eq('id', deliveryId);

      if (error) throw error;

      setDeliveries(prev =>
        prev.map(d =>
          d.id === deliveryId
            ? { ...d, ...updateData }
            : d
        )
      );

      toast({
        title: "Success",
        description: `Delivery confirmed by ${type}`,
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

  const assignDeliveryAgent = async (deliveryId: string, agentId: string) => {
    try {
      const { error } = await supabase
        .from('deliveries')
        .update({ delivery_agent_id: agentId })
        .eq('id', deliveryId);

      if (error) throw error;

      // Fetch agent name
      const { data: agent } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', agentId)
        .single();

      setDeliveries(prev =>
        prev.map(d =>
          d.id === deliveryId
            ? { ...d, delivery_agent_id: agentId, delivery_agent: agent }
            : d
        )
      );

      toast({
        title: "Success",
        description: "Delivery agent assigned",
      });
    } catch (error) {
      console.error('Error assigning delivery agent:', error);
      toast({
        title: "Error",
        description: "Failed to assign delivery agent",
        variant: "destructive",
      });
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch =
      delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.pharmacy?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.order?.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.delivery_agent?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || delivery.status_delivery === statusFilter;

    const matchesPharmacy = !pharmacyFilter || delivery.pharmacy_id === pharmacyFilter;

    return matchesSearch && matchesStatus && matchesPharmacy;
  });

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

  if (loading) {
    return (
      <DashboardLayout requiredRole="admin">
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
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Delivery Management</h1>
          <p className="text-muted-foreground">Monitor and manage delivery operations</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Input
              placeholder="Search by ID, pharmacy, customer, or agent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 max-w-md"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Deliveries List */}
        <div className="grid gap-4">
          {filteredDeliveries.map((delivery) => (
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
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-muted-foreground" />
                          <span>{delivery.pharmacy?.name || 'Unknown Pharmacy'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>Order #{delivery.order?.id.slice(0, 8)} - ₦{delivery.order?.total_amount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{delivery.order?.customer_name || 'Unknown Customer'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span>{delivery.delivery_agent?.full_name || 'No Agent Assigned'}</span>
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
                    {!delivery.confirmed_by_admin && (
                      <Button
                        onClick={() => confirmDelivery(delivery.id, 'admin')}
                        variant="outline"
                        size="sm"
                      >
                        Confirm (Admin)
                      </Button>
                    )}

                    <Select onValueChange={(value) => updateDeliveryStatus(delivery.id, value as any)}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-transit">In Transit</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Agent ID"
                      className="w-32"
                      onBlur={(e) => {
                        if (e.target.value) {
                          assignDeliveryAgent(delivery.id, e.target.value);
                        }
                      }}
                    />
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

          {filteredDeliveries.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Deliveries Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all'
                    ? 'No deliveries match your search criteria.'
                    : 'No deliveries have been created yet.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDeliveries;
