import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-4xl font-bold text-primary">404</h1>
      <h2 className="mt-2 text-2xl font-semibold">Page Not Found</h2>
      <p className="mt-4 text-gray-600">The page you're looking for doesn't exist or has been moved.</p>
      <Link 
        href="/" 
        className="px-4 py-2 mt-6 text-white bg-primary rounded hover:bg-primary/90 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
} 