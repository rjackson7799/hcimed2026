import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/portal/context/AuthContext';
import { Clock } from 'lucide-react';

export function SessionTimeoutWarning() {
  const { showTimeoutWarning, extendSession, signOut } = useAuth();

  return (
    <AlertDialog open={showTimeoutWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Session Expiring Soon
          </AlertDialogTitle>
          <AlertDialogDescription>
            Your session will expire in 5 minutes due to inactivity.
            For the security of patient information, you will be
            automatically logged out. Click below to stay logged in.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={signOut}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Log Out Now
          </AlertDialogAction>
          <AlertDialogAction onClick={extendSession}>
            Stay Logged In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
