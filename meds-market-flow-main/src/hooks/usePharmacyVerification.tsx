import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';

export function usePharmacyVerification() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || role !== 'pharmacy') {
      setVerificationStatus(null);
      setLoading(false);
      return;
    }

    const fetchPharmacyStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('pharmacies')
          .select('verification_status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error fetching pharmacy status:', error);
          setVerificationStatus(null);
        } else if (data && data.length > 0) {
          setVerificationStatus(data[0].verification_status);
        } else {
          setVerificationStatus(null);
        }
      } catch (error) {
        console.error('Error fetching pharmacy status:', error);
        setVerificationStatus(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacyStatus();
  }, [user, role]);

  return { 
    verificationStatus, 
    loading,
    isVerified: verificationStatus === 'approved',
    isPending: verificationStatus === 'pending'
  };
}