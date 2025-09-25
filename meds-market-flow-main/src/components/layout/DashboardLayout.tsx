import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { usePharmacyVerification } from '@/hooks/usePharmacyVerification';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Button } from '@/components/ui/button';
import { PharmacyVerificationModal } from '@/components/modals/PharmacyVerificationModal';
import { User } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'pharmacy' | 'customer';
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const { user, loading: authLoading, signOut } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const { isPending, loading: verificationLoading } = usePharmacyVerification();

  if (authLoading || roleLoading || verificationLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-14 flex items-center justify-between border-b bg-background px-4">
            <SidebarTrigger />
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4" />
                <span>{user.user_metadata?.full_name || user.email}</span>
                <span className="text-muted-foreground">({role})</span>
              </div>
              <Button onClick={signOut} variant="ghost" size="sm">
                Sign Out
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className={`flex-1 p-6 ${isPending ? 'blur-sm pointer-events-none' : ''}`}>
            {children}
          </main>
        </div>
      </div>
      
      {/* Pharmacy Verification Modal */}
      <PharmacyVerificationModal isOpen={isPending} />
    </SidebarProvider>
  );
}