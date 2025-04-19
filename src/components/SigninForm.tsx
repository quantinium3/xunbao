import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useClerk } from '@clerk/clerk-react';
import SpaceElements from '../components/bgElements';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function SigninForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { client, setActive } = useClerk();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Client-side validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email format');
      setIsLoading(false);
      return;
    }
    if (!formData.password) {
      setError('Password is required');
      setIsLoading(false);
      return;
    }

    try {
      const signInAttempt = await client.signIn.create({
        identifier: formData.email,
        password: formData.password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });

        // Sync with your backend
        try {
          const response = await fetch('https://xunback.manantechnosurge.tech/api/user/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
          if (!response.ok) {
            console.error('Backend sync failed:', await response.text());
          }
        } catch (err) {
          console.error('Backend sync failed:', err);
        }

        navigate({ to: '/quiz' });
      } else {
        setError('Sign-in incomplete. Please try again.');
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || 'An error occurred during sign-in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <SpaceElements className="absolute inset-0 z-0" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 space-y-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold underline text-white text-center">
          Sign In
        </h1>
        <div className="w-full max-w-md bg-black/70 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-white block text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 text-white bg-transparent border-white/20 placeholder-white/50"
                placeholder="example@domain.com"
                autoFocus
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="text-white block text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 text-white bg-transparent border-white/20 placeholder-white/50"
                placeholder="Enter your password"
                required
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? 'Signing In...' : 'Continue'}
            </Button>
          </form>
          <p className="mt-4 text-sm text-center text-white">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-400 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SigninForm;