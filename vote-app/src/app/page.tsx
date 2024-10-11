import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Welcome to Voter</h1>
            <p className="py-6">Your trusted platform for secure and transparent voting.</p>
            <div className="space-y-4">
              <Link href="/signup/voter" className="btn btn-primary w-full">Sign up to Vote</Link>
              <Link href="/signup/campaign" className="btn btn-secondary w-full">Sign up to Add Campaign</Link>
              <Link href="/information" className="btn btn-outline w-full">Learn More</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}