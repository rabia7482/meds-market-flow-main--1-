import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Bike, Store, User, Mail, Phone, MapPin, IdCard, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Page for partners to submit applications as either dispatch riders or vendor partners.
// Two-tab form UI with local state, validation, and success toasts.

const PartnerSignup = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  // Controls which application form is visible
  const [tab, setTab] = useState<'rider' | 'vendor'>('rider');

  // Rider application form state
  const [rider, setRider] = useState({
    fullName: '',
    email: '',
    phone: '',
    vehicleType: 'bike',
    licenseId: '',
    plateNumber: '',
    city: '',
    state: '',
    agree: false,
  });

  // Vendor application form state
  const [vendor, setVendor] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    registrationNo: '',
    address: '',
    city: '',
    state: '',
    agree: false,
  });

  // Minimal client-side validation; shows a toast if required fields are missing.
  // this is where you would submit to an API.
  const handleRiderSubmit = () => {
    if (!rider.fullName || !rider.email || !rider.phone || !rider.agree) {
      toast({ title: 'Missing information', description: 'Please fill all required fields and agree to the terms.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Application submitted', description: 'You can now track your orders.' });
    setTimeout(() => navigate('/partner/orders'), 600);
  };

  // Same validation pattern for vendor applications
  const handleVendorSubmit = () => {
    if (!vendor.businessName || !vendor.contactName || !vendor.email || !vendor.phone || !vendor.agree) {
      toast({ title: 'Missing information', description: 'Please fill all required fields and agree to the terms.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Application submitted', description: 'You can now track your orders.' });
    setTimeout(() => navigate('/partner/orders'), 600);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header copy that explains the partner program */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Partner with MedsMarket</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Sign up as a dispatch rider or vendor partner and help deliver medications quickly and safely to patients.</p>
        </div>

        {/* Tabs toggle between Rider and Vendor application forms */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'rider' | 'vendor')} className="max-w-5xl mx-auto w-full">
          <TabsList className="mx-auto">
            <TabsTrigger value="rider" className="flex items-center gap-2"><Bike className="h-4 w-4" /> Rider</TabsTrigger>
            <TabsTrigger value="vendor" className="flex items-center gap-2"><Store className="h-4 w-4" /> Vendor</TabsTrigger>
          </TabsList>

          {/* Rider Form */}
          <TabsContent value="rider">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-cyan-600" /> Dispatch Rider Application</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Rider details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="riderName">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="riderName" className="pl-9" placeholder="Jane Doe" value={rider.fullName} onChange={(e) => setRider({ ...rider, fullName: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="riderEmail">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="riderEmail" type="email" className="pl-9" placeholder="jane@email.com" value={rider.email} onChange={(e) => setRider({ ...rider, email: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="riderPhone">Phone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="riderPhone" className="pl-9" placeholder="0803 000 0000" value={rider.phone} onChange={(e) => setRider({ ...rider, phone: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="vehicleType">Vehicle Type *</Label>
                    <Select value={rider.vehicleType} onValueChange={(v) => setRider({ ...rider, vehicleType: v })}>
                      <SelectTrigger id="vehicleType"><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bike">Bike</SelectItem>
                        <SelectItem value="tricycle">Tricycle</SelectItem>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="licenseId">Driver License/ID *</Label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="licenseId" className="pl-9" placeholder="ID-123456" value={rider.licenseId} onChange={(e) => setRider({ ...rider, licenseId: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="plateNumber">Plate Number</Label>
                    <Input id="plateNumber" placeholder="ABC-123-XY" value={rider.plateNumber} onChange={(e) => setRider({ ...rider, plateNumber: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="riderCity">City</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="riderCity" className="pl-9" placeholder="Ikeja" value={rider.city} onChange={(e) => setRider({ ...rider, city: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="riderState">State</Label>
                    <Select value={rider.state} onValueChange={(v) => setRider({ ...rider, state: v })}>
                      <SelectTrigger id="riderState"><SelectValue placeholder="Select state" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lagos">Lagos</SelectItem>
                        <SelectItem value="abuja">Abuja</SelectItem>
                        <SelectItem value="rivers">Rivers</SelectItem>
                        <SelectItem value="kano">Kano</SelectItem>
                        <SelectItem value="oyo">Oyo</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Terms checkbox and submit */}
                <div className="flex items-start gap-3">
                  <Checkbox id="riderAgree" checked={rider.agree} onCheckedChange={(c) => setRider({ ...rider, agree: Boolean(c) })} />
                  <Label htmlFor="riderAgree" className="text-sm">I agree to the terms and confirm my documents are valid.</Label>
                </div>

                <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600" onClick={handleRiderSubmit}>Submit Rider Application</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vendor Form */}
          <TabsContent value="vendor">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Store className="h-5 w-5 text-cyan-600" /> Vendor Application</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Vendor details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input id="businessName" placeholder="Acme Logistics" value={vendor.businessName} onChange={(e) => setVendor({ ...vendor, businessName: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="contactName">Contact Person *</Label>
                    <Input id="contactName" placeholder="John Doe" value={vendor.contactName} onChange={(e) => setVendor({ ...vendor, contactName: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="vendorEmail">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="vendorEmail" type="email" className="pl-9" placeholder="contact@acme.com" value={vendor.email} onChange={(e) => setVendor({ ...vendor, email: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="vendorPhone">Phone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="vendorPhone" className="pl-9" placeholder="0803 000 0000" value={vendor.phone} onChange={(e) => setVendor({ ...vendor, phone: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="registrationNo">Business Registration No.</Label>
                    <Input id="registrationNo" placeholder="RC-123456" value={vendor.registrationNo} onChange={(e) => setVendor({ ...vendor, registrationNo: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Pickup Address</Label>
                    <Input id="address" placeholder="12 Example Street" value={vendor.address} onChange={(e) => setVendor({ ...vendor, address: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="vendorCity">City</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="vendorCity" className="pl-9" placeholder="Yaba" value={vendor.city} onChange={(e) => setVendor({ ...vendor, city: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="vendorState">State</Label>
                    <Select value={vendor.state} onValueChange={(v) => setVendor({ ...vendor, state: v })}>
                      <SelectTrigger id="vendorState"><SelectValue placeholder="Select state" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lagos">Lagos</SelectItem>
                        <SelectItem value="abuja">Abuja</SelectItem>
                        <SelectItem value="rivers">Rivers</SelectItem>
                        <SelectItem value="kano">Kano</SelectItem>
                        <SelectItem value="oyo">Oyo</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Terms checkbox and submit */}
                <div className="flex items-start gap-3">
                  <Checkbox id="vendorAgree" checked={vendor.agree} onCheckedChange={(c) => setVendor({ ...vendor, agree: Boolean(c) })} />
                  <Label htmlFor="vendorAgree" className="text-sm">I agree to the partnership terms and confirm provided information is accurate.</Label>
                </div>

                <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600" onClick={handleVendorSubmit}>Submit Vendor Application</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PartnerSignup;

