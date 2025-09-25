import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Store } from 'lucide-react';

const PharmacyRegister = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const pharmacyData = {
      user_id: user.id,
      name: formData.get('name') as string,
      license_number: formData.get('license_number') as string,
      nafdac_number: formData.get('nafdac_number') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
    };

    try {
      // Insert pharmacy
      const { error: pharmacyError } = await supabase
        .from('pharmacies')
        .insert(pharmacyData);

      if (pharmacyError) throw pharmacyError;

      // Add pharmacy role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'pharmacy'
        });

      if (roleError) throw roleError;

      toast({
        title: "Registration submitted!",
        description: "Your pharmacy registration is pending verification. You'll be notified once approved.",
      });

      navigate('/');
    } catch (error: any) {
      console.error('Error registering pharmacy:', error);
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <Store className="h-12 w-12 text-cyan-800 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Register Your Pharmacy</h1>
          <p className="text-muted-foreground">
            Join our network of verified pharmacies and start serving customers
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pharmacy Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Pharmacy Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="MediCare Pharmacy"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_number">License Number *</Label>
                  <Input
                    id="license_number"
                    name="license_number"
                    placeholder="PCN/2023/001234"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nafdac_number">NAFDAC Number</Label>
                  <Input
                    id="nafdac_number"
                    name="nafdac_number"
                    placeholder="A7-1234 (if applicable)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+234 901 234 5678"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Business Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="info@medicare.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="123 Main Street, Victoria Island"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Lagos"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="Lagos State"
                    required
                  />
                </div>
              </div>



              <Button type="submit" className="w-full bg-cyan-800" disabled={loading}>
                {loading ? "Submitting..." : "Submit Registration"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PharmacyRegister;