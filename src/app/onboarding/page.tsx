'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

const waitMessages = [
  'Initializing your Stripe account...',
  'Configuring payment methods...',
  'Setting up security features...',
  'Finalizing account details...',
  'Almost there! Just a few more moments...',
];

export default function StripeReturn() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success'>('loading');
  const [progress, setProgress] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [waitMessageIndex, setWaitMessageIndex] = useState(0);

  useEffect(() => {
    const simulateProgress = () => {
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(interval);
            setStatus('success');
            return 100;
          }
          if (prevProgress % 20 === 0) {
            setWaitMessageIndex(
              (prevIndex) => (prevIndex + 1) % waitMessages.length
            );
          }
          return prevProgress + 5;
        });
      }, 500);
    };

    simulateProgress();
  }, []);

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => setShowAlert(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleReturnToDashboard = () => {
    router.push('/dashboard');
  };

  const handleViewSettings = () => {
    router.push('/settings');
  };

  const LoadingScreen = () => (
    <Card className="w-full max-w-md overflow-hidden border-0 shadow-lg">
      <CardHeader className="bg-white pb-0">
        <CardTitle className="text-2xl font-bold text-gray-800">
          Stripe Onboarding
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-6 p-6">
        <Loader2 className="w-16 h-16 text-red-600 animate-spin" />
        <p className="text-xl text-center text-gray-700">
          Processing your onboarding...
        </p>
        <div className="w-full space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-500 text-center">
            {progress}% Complete
          </p>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={waitMessageIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-sm text-gray-600 text-center"
          >
            {waitMessages[waitMessageIndex]}
          </motion.p>
        </AnimatePresence>
      </CardContent>
    </Card>
  );

  const SuccessScreen = () => (
    <Card className="w-full max-w-md overflow-hidden border-0 shadow-lg">
      <CardHeader className="bg-white pb-0">
        <CardTitle className="text-2xl font-bold text-gray-800">
          Stripe Onboarding Complete
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-6 p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <CheckCircle className="w-24 h-24 text-red-600" />
        </motion.div>
        <p className="text-xl text-center text-gray-700">
          Congratulations! Your Stripe account has been successfully set up and
          integrated.
        </p>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="bg-red-50 border border-red-200 text-red-800">
              <AlertDescription>
                You can now close this window. The onboarding process is
                complete.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4 p-6 bg-gray-100">
        <Button
          onClick={handleReturnToDashboard}
          className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors duration-300"
        >
          Go to Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button
          onClick={handleViewSettings}
          variant="outline"
          className="w-full border-red-600 text-red-600 hover:bg-red-50 transition-colors duration-300"
        >
          View Account Settings
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {status === 'loading' ? <LoadingScreen /> : <SuccessScreen />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
