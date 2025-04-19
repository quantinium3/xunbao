import { useState,useEffect } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useClerk,useAuth } from '@clerk/clerk-react';
import SpaceElements from '../components/bgElements';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Define the route for the sign-up page
export const Route = createFileRoute('/signup')({
  component: SignUp,
});

function SignUp() {
  const [formData, setFormData] = useState({
    fullName: '',
    rollNumber: '',
    email: '',
    branch: '',
    course: '',
    phoneNumber: '',
    yog: '',
    password: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const { client, setActive } = useClerk();
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  useEffect(() => {
    if (isSignedIn) {
      navigate({ to: '/quiz', replace: true });
    }
  }, [isSignedIn, navigate]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Client-side validation
    if (!formData.fullName) {
      setError('Full name is required');
      setIsLoading(false);
      return;
    }
    if (!formData.rollNumber) {
      setError('Roll number is required');
      setIsLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email format');
      setIsLoading(false);
      return;
    }
    if (!formData.branch) {
      setError('Branch is required');
      setIsLoading(false);
      return;
    }
    if (!formData.course) {
      setError('Course is required');
      setIsLoading(false);
      return;
    }
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      setError('Phone number must be a 10-digit number');
      setIsLoading(false);
      return;
    }
    if (formData.yog.length < 4) {
      setError('Year of graduation must be valid');
      setIsLoading(false);
      return;
    }
    if (!formData.password) {
      setError('Password is required');
      setIsLoading(false);
      return;
    }

    try {
      await client.signUp.create({
        emailAddress: formData.email,
        password: formData.password,
      });

      await client.signUp.prepareEmailAddressVerification();
      setShowVerification(true);
    } catch (err) {
      setError(err.errors?.[0]?.message || 'An error occurred during sign-up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!verificationCode) {
      setError('Verification code is required');
      setIsLoading(false);
      return;
    }

    try {
      const signUpAttempt = await client.signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });

        // // Sync with your backend
        // try {
        //   const response = await fetch('https://xunback.manantechnosurge.tech/api/user/register', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(formData),
        //   });
        //   if (!response.ok) {
        //     console.error('Backend sync failed:', await response.text());
        //   }
        // } catch (err) {
        //   console.error('Backend sync failed:', err);
        // }

        navigate({ to: '/quiz' });
      } else {
        setError('Verification incomplete. Please try again.');
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || 'An error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <SpaceElements className="absolute inset-0 z-0" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 space-y-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold underline text-white text-center">
          Sign Up
        </h1>
        <div className="w-full max-w-md bg-black/70 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl">
          {!showVerification ? (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="text-white block text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="mt-1 text-white bg-transparent border-white/20 placeholder-white/50"
                  placeholder="Name..."
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="rollNumber" className="text-white block text-sm font-medium">
                  Roll Number
                </label>
                <Input
                  id="rollNumber"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleInputChange}
                  className="mt-1 text-white bg-transparent border-white/20 placeholder-white/50"
                  placeholder="Roll Number"
                />
              </div>
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
                  required
                />
              </div>
              <div>
                <label htmlFor="branch" className="text-white block text-sm font-medium">
                  Branch
                </label>
                <Input
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  className="mt-1 text-white bg-transparent border-white/20 placeholder-white/50"
                  placeholder="Computer Science"
                />
              </div>
              <div>
                <label htmlFor="course" className="text-white block text-sm font-medium">
                  Course
                </label>
                <Input
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  className="mt-1 text-white bg-transparent border-white/20 placeholder-white/50"
                  placeholder="B.TECH"
                />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="text-white block text-sm font-medium">
                  Phone Number
                </label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="mt-1 text-white bg-transparent border-white/20 placeholder-white/50"
                  placeholder="9876543210"
                />
              </div>
              <div>
                <label htmlFor="yog" className="text-white block text-sm font-medium">
                  Year of Graduation
                </label>
                <Input
                  id="yog"
                  name="yog"
                  value={formData.yog}
                  onChange={handleInputChange}
                  className="mt-1 text-white bg-transparent border-white/20 placeholder-white/50"
                  placeholder="e.g., 2027"
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
                {isLoading ? 'Signing Up...' : 'Continue'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerification} className="space-y-4">
              <h2 className="text-xl font-semibold text-white text-center">Verify Your Email</h2>
              <div>
                <label htmlFor="code" className="text-white block text-sm font-medium">
                  Verification Code
                </label>
                <Input
                  id="code"
                  name="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="mt-1 text-white bg-transparent border-white/20 placeholder-white/50"
                  placeholder="Enter your verification code"
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
                {isLoading ? 'Verifying...' : 'Verify'}
              </Button>
            </form>
          )}
          {!showVerification && (
            <p className="mt-4 text-sm text-center text-white">
              Already have an account?{' '}
              <Link to="/signin" className="text-blue-400 hover:underline">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SignUp;