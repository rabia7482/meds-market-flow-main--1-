import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'admin' | 'pharmacy' | 'customer' | 'delivery_agent';

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
          // Prioritize roles: admin > pharmacy > delivery_agent > customer
          const roles = data.map(d => d.role);
          if (roles.includes('admin')) {
            setRole('admin');
          } else if (roles.includes('pharmacy')) {
            setRole('pharmacy');
          } else if (roles.includes('delivery_agent')) {
            setRole('delivery_agent');
          } else {
            setRole('customer');
          }
        } else {
          // Fallback to user_metadata if no user_roles entry
          const metadataRole = user?.user_metadata?.role as UserRole | undefined;
          if (metadataRole) {
            // Insert the role into user_roles table if it exists in metadata
            const { error: insertError } = await supabase
              .from('user_roles')
              .insert({ user_id: user.id, role: metadataRole });

            if (insertError) {
              console.error('Error inserting user role:', insertError);
            } else {
              console.log('User role inserted:', metadataRole);
            }

            // Set the role from metadata
            if (metadataRole === 'admin') {
              setRole('admin');
            } else if (metadataRole === 'pharmacy') {
              setRole('pharmacy');
            } else if (metadataRole === 'delivery_agent') {
              setRole('delivery_agent');
            } else {
              setRole('customer');
            }
          } else {
            setRole('customer');
          }
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