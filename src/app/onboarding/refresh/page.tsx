'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, CheckCircle, ArrowRight, XCircle } from 'lucide-react';
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

export default function StripeRefresh() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const simulateRefresh = () => {
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(interval);
            setStatus(Math.random() > 0.1 ? 'success' : 'error'); // 10% chance of error for demonstration
            return 100;
          }
          return prevProgress + 10;
        });
      }, 500);
    };

    simulateRefresh();
  }, []);

  const handleReturnToDashboard = () => {
    router.push('/dashboard');
  };

  const handleRetry = () => {
    setStatus('loading');
    setProgress(0);
  };

  const LoadingScreen = () => (
    <Card className="w-full max-w-md overflow-hidden border-0 shadow-lg">
      <CardHeader className="bg-white pb-0">
        <CardTitle className="text-2xl font-bold text-gray-800">
          Refreshing Stripe Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-6 p-6">
        <RefreshCw className="w-16 h-16 text-red-600 animate-spin" />
        <p className="text-xl text-center text-gray-700">
          Updating your Stripe account information...
        </p>
        <div className="w-full space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-500 text-center">
            {progress}% Complete
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const SuccessScreen = () => (
    <Card className="w-full max-w-md overflow-hidden border-0 shadow-lg">
      <CardHeader className="bg-white pb-0">
        <CardTitle className="text-2xl font-bold text-gray-800">
          Stripe Connection Refreshed
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
          Your Stripe account information has been successfully updated.
        </p>
        <Alert className="bg-red-50 border border-red-200 text-red-800">
          <AlertDescription>
            You can now close this window and return to your dashboard.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 p-6 bg-gray-100">
        <Button
          onClick={handleReturnToDashboard}
          className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors duration-300"
        >
          Return to Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );

  const ErrorScreen = () => (
    <Card className="w-full max-w-md overflow-hidden border-0 shadow-lg">
      <CardHeader className="bg-white pb-0">
        <CardTitle className="text-2xl font-bold text-gray-800">
          Refresh Failed
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-6 p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <XCircle className="w-24 h-24 text-red-600" />
        </motion.div>
        <p className="text-xl text-center text-gray-700">
          We encountered an issue while refreshing your Stripe connection.
        </p>
        <Alert className="bg-red-50 border border-red-200 text-red-800">
          <AlertDescription>
            Please try again or contact support if the problem persists.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 p-6 bg-gray-100">
        <Button
          onClick={handleRetry}
          className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors duration-300"
        >
          Retry
          <RefreshCw className="ml-2 h-4 w-4" />
        </Button>
        <Button
          onClick={handleReturnToDashboard}
          variant="outline"
          className="w-full border-red-600 text-red-600 hover:bg-red-50 transition-colors duration-300"
        >
          Return to Dashboard
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
          {status === 'loading' && <LoadingScreen />}
          {status === 'success' && <SuccessScreen />}
          {status === 'error' && <ErrorScreen />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
