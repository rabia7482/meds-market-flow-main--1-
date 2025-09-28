import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill, ShoppingBag, Shield, Users, Store, Plus } from 'lucide-react';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  if (authLoading || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Role-based redirects
  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (role === 'pharmacy') {
    return <Navigate to="/pharmacy/dashboard" replace />;
  }

  if (role === 'delivery_agent') {
    return <Navigate to="/delivery/dashboard" replace />;
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <header className="border-b backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Pill className="h-8 w-8 text-blue-800" />
            <h1 className="text-2xl font-bold text-blue-800">MedsMarket</h1>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-blue-800">Welcome, {user.user_metadata?.full_name || user.email}</p>
            <Button onClick={signOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12  bg-gradient-to-br from-cyan-700 to-blue-100 ">
        <div className='grid md:grid-cols-2 gap-6 items-center mt-12 '>
          <div className="flex justify-center">
          <img
            src="/pharmacy-illustration.png"
            alt="Pharmacy Illustration"
            className="w-full max-w-md mx-auto mb-8 rounded-lg shadow-lg"
          />
        </div>

        <div className="order-2 md:order-1 text-align-left text-blue-800">
          <h2 className="text-4xl font-bold mb-4">Your Trusted Online Pharmacy</h2>
          <p className="text-xl text-blue-800 max-w-2xl mx-auto">
            Connect with licensed pharmacies, order medications safely, and get them delivered to your doorstep.
          </p>
        </div>
        </div>
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 mt-28 ">
          <Card className="text-center ">
            <CardHeader className='bg-accent/90'>
              <Pill className="h-12 w-12 text-cyan-800 mx-auto mb-2" />
              <CardTitle>Licensed Pharmacies</CardTitle>
            </CardHeader>
            <CardContent className='bg-accent/90'>
              <CardDescription>
                All our partner pharmacies are NAFDAC-verified and licensed to ensure you get authentic medications.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center bg-accent/90">
            <CardHeader>
              <ShoppingBag className="h-12 w-12 text-cyan-800 mx-auto mb-2" />
              <CardTitle>Easy Ordering</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Browse medications and place orders with just a few clicks.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader  className='bg-accent/90'>
              <Shield className="h-12 w-12 text-cyan-800 mx-auto mb-2" />
              <CardTitle>Secure & Safe</CardTitle>
            </CardHeader>
            <CardContent  className='bg-accent/90'>
              <CardDescription>
                Your medical information is protected with enterprise-grade security and encryption.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-6">
          <div className="space-x-4">
            <Button size="lg" className="bg-cyan-900 hover:bg-gray-200" asChild>
              <a href="/browse">Browse Medications</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/browse">Find Pharmacies</a>
            </Button>
          </div>
          
          {/* Pharmacy Registration CTA */}
          <div className="bg-accent/50 rounded-lg p-6 max-w-md mx-auto">
            <Store className="h-8 w-8 text-cyan-800 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Are you a pharmacy owner?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Join our network and reach more customers
            </p>
            <Button variant="outline" size="sm"  asChild>
              <a href="/pharmacy-register">
                <Plus className="h-4 w-4 mr-1" />
                Register Your Pharmacy
              </a>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
