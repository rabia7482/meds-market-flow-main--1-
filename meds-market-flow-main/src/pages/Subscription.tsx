import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Check, 
  Star, 
  Shield, 
  Clock, 
  Truck, 
  Phone, 
  Heart, 
  CreditCard,
  User,
  Mail,
  MapPin,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
}

const Subscription = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');
  const [isYearly, setIsYearly] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    paymentMethod: '',
    agreeToTerms: false
  });
  const { toast } = useToast();

  const plans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: isYearly ? 2400 : 250,
      period: isYearly ? 'year' : 'month',
      description: 'Essential medication delivery service',
      color: 'from-blue-500 to-blue-600',
      features: [
        'Free delivery on orders above ₦5,000',
        'Standard delivery (2-3 days)',
        'Basic customer support',
        'Medication reminders',
        'Order tracking'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: isYearly ? 4800 : 500,
      period: isYearly ? 'year' : 'month',
      description: 'Enhanced healthcare experience',
      color: 'from-cyan-500 to-cyan-600',
      popular: true,
      features: [
        'Free delivery on all orders',
        'Express delivery (1-2 days)',
        'Priority customer support',
        'Medication reminders & health tips',
        'Advanced order tracking',
        'Prescription management',
        'Health consultation calls',
        'Family account management'
      ]
    },
    {
      id: 'vip',
      name: 'VIP',
      price: isYearly ? 9600 : 1000,
      period: isYearly ? 'year' : 'month',
      description: 'Premium healthcare concierge service',
      color: 'from-purple-500 to-purple-600',
      features: [
        'Free same-day delivery',
        'Dedicated health concierge',
        '24/7 priority support',
        'Personalized health plans',
        'Monthly health check-ins',
        'Prescription auto-refill',
        'Family & caregiver access',
        'Health data analytics',
        'Emergency medication delivery',
        'Telemedicine consultations'
      ]
    }
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubscribe = () => {
    if (!formData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Here you would integrate with your payment processor
    toast({
      title: "Subscription Successful!",
      description: `Welcome to ${plans.find(p => p.id === selectedPlan)?.name} plan! You'll receive a confirmation email shortly.`,
    });
  };

  const selectedPlanData = plans.find(plan => plan.id === selectedPlan);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Choose Your Health Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get access to premium healthcare services, fast medication delivery, and personalized health support
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4">
          <span className={`text-sm font-medium ${!isYearly ? 'text-cyan-600' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsYearly(!isYearly)}
            className="relative"
          >
            <div className={`w-6 h-6 rounded-full bg-cyan-600 transition-transform duration-200 ${isYearly ? 'translate-x-3' : '-translate-x-3'}`} />
          </Button>
          <span className={`text-sm font-medium ${isYearly ? 'text-cyan-600' : 'text-muted-foreground'}`}>
            Yearly
          </span>
          {isYearly && (
            <Badge className="bg-green-100 text-green-700 border-green-200">
              Save 20%
            </Badge>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative cursor-pointer transition-all duration-300 hover:shadow-xl ${
                selectedPlan === plan.id 
                  ? 'ring-2 ring-cyan-500 shadow-lg scale-105' 
                  : 'hover:scale-102'
              } ${plan.popular ? 'border-cyan-500' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-cyan-600 text-white px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-cyan-600">
                    ₦{plan.price.toLocaleString()}
                    <span className="text-lg text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full mt-6 bg-gradient-to-r ${plan.color} hover:opacity-90 text-white font-semibold`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan(plan.id);
                  }}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Choose Plan'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">Why Choose Our Service?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <Shield className="h-12 w-12 text-cyan-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Verified Pharmacies</h3>
              <p className="text-sm text-muted-foreground">All medications from licensed and verified pharmacies</p>
            </Card>
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <Truck className="h-12 w-12 text-cyan-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Fast Delivery</h3>
              <p className="text-sm text-muted-foreground">Same-day and express delivery options available</p>
            </Card>
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <Heart className="h-12 w-12 text-cyan-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Health Support</h3>
              <p className="text-sm text-muted-foreground">Personalized health tips and medication reminders</p>
            </Card>
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <Phone className="h-12 w-12 text-cyan-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">Round-the-clock customer support and health consultations</p>
            </Card>
          </div>
        </div>

        {/* Subscription Form */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Complete Your Subscription</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Delivery Address</h3>
                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your street address"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter your city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lagos">Lagos</SelectItem>
                        <SelectItem value="abuja">Abuja</SelectItem>
                        <SelectItem value="kano">Kano</SelectItem>
                        <SelectItem value="rivers">Rivers</SelectItem>
                        <SelectItem value="oyo">Oyo</SelectItem>
                        <SelectItem value="kaduna">Kaduna</SelectItem>
                        <SelectItem value="enugu">Enugu</SelectItem>
                        <SelectItem value="delta">Delta</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Payment Method</h3>
                <div>
                  <Label htmlFor="paymentMethod">Select Payment Method</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="ussd">USSD</SelectItem>
                      <SelectItem value="wallet">Digital Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Terms and Conditions */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      I agree to the Terms of Service and Privacy Policy
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      By subscribing, you agree to our terms and conditions. You can cancel your subscription at any time.
                    </p>
                  </div>
                </div>
              </div>

              {/* Subscription Summary */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">Subscription Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Plan:</span>
                      <span className="font-medium">{selectedPlanData?.name} Plan</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Billing:</span>
                      <span className="font-medium">{isYearly ? 'Yearly' : 'Monthly'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span className="font-medium">₦{selectedPlanData?.price.toLocaleString()}</span>
                    </div>
                    {isYearly && (
                      <div className="flex justify-between text-green-600">
                        <span>Savings:</span>
                        <span className="font-medium">₦{((selectedPlanData?.price || 0) * 12 * 0.2).toLocaleString()}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>₦{selectedPlanData?.price.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subscribe Button */}
              <Button 
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 text-lg"
                onClick={handleSubscribe}
                disabled={!formData.agreeToTerms}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Subscribe Now - ₦{selectedPlanData?.price.toLocaleString()}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Subscription;