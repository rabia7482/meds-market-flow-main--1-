import { AlertCircle, Clock } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface PharmacyVerificationModalProps {
  isOpen: boolean;
}

export function PharmacyVerificationModal({ isOpen }: PharmacyVerificationModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent 
        className="sm:max-w-md text-center" 
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center space-y-4 p-6">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Verification Pending</h2>
            <p className="text-muted-foreground">
              Your pharmacy registration is currently under review by our admin team.
            </p>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 w-full">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-800">
                <p className="font-medium">What happens next?</p>
                <ul className="mt-1 space-y-1 text-left">
                  <li>• Admin will review your pharmacy details</li>
                  <li>• Verification typically takes 24-48 hours</li>
                  <li>• You'll receive an email once approved</li>
                </ul>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Please check back later or contact support if you have any questions.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}