import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Eye, MapPin, Phone, Mail } from 'lucide-react';

interface Pharmacy {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  license_number: string;
  nafdac_number?: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const AdminPharmacies = () => {
  const { toast } = useToast();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPharmacies(data || []);
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      toast({
        title: "Error",
        description: "Failed to load pharmacies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateVerificationStatus = async (pharmacyId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('pharmacies')
        .update({ 
          verification_status: status,
          verified_at: status === 'approved' ? new Date().toISOString() : null
        })
        .eq('id', pharmacyId);

      if (error) throw error;

      setPharmacies(prev => 
        prev.map(pharmacy => 
          pharmacy.id === pharmacyId 
            ? { ...pharmacy, verification_status: status }
            : pharmacy
        )
      );

      toast({
        title: "Success",
        description: `Pharmacy ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      });
    } catch (error) {
      console.error('Error updating pharmacy status:', error);
      toast({
        title: "Error",
        description: "Failed to update pharmacy status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading pharmacies...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pharmacy Management</h1>
          <p className="text-muted-foreground">Review and manage pharmacy registrations</p>
        </div>

        <div className="grid gap-6">
          {pharmacies.map((pharmacy) => (
            <Card key={pharmacy.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{pharmacy.name}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {pharmacy.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {pharmacy.phone}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(pharmacy.verification_status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-sm text-muted-foreground">
                          {pharmacy.address}, {pharmacy.city}, {pharmacy.state}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">License Details</p>
                    <p className="text-sm text-muted-foreground">
                      License: {pharmacy.license_number}
                    </p>
                    {pharmacy.nafdac_number && (
                      <p className="text-sm text-muted-foreground">
                        NAFDAC: {pharmacy.nafdac_number}
                      </p>
                    )}
                  </div>
                </div>

                {pharmacy.verification_status === 'pending' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => updateVerificationStatus(pharmacy.id, 'approved')}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => updateVerificationStatus(pharmacy.id, 'rejected')}
                      className="flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                )}

                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Registered: {new Date(pharmacy.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}

          {pharmacies.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Pharmacies Found</h3>
                <p className="text-muted-foreground">No pharmacy registrations to review at this time.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPharmacies;