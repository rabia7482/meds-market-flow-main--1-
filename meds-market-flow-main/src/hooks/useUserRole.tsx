import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'admin' | 'pharmacy' | 'customer';

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchUserRole = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user role:', error);
          setRole('customer'); // Default to customer
        } else if (data && data.length > 0) {
          // Prioritize roles: admin > pharmacy > customer
          const roles = data.map(d => d.role);
          if (roles.includes('admin')) {
            setRole('admin');
          } else if (roles.includes('pharmacy')) {
            setRole('pharmacy');
          } else {
            setRole('customer');
          }
        } else {
          setRole('customer');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('customer');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  return { role, loading };
}