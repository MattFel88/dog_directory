'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import BrandButton from '../../components/BrandButton';
import { supabase } from '../../../lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setErrorMsg(error.message || 'Login failed. Please check your credentials.');
    } else {
      router.push('/'); // Or redirect to /dashboard, etc.
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center bg-[#f6f3ee] px-4 py-12">
        <div className="bg-white border-2 border-[#dbc7a1] rounded-3xl shadow-2xl px-8 py-10 max-w-md w-full flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="Paws-itivity Logo"
            width={72}
            height={72}
            className="rounded-full mb-4 border-4 border-[#a3c75c] bg-[#f6f3ee]"
          />
          <h1 className="text-3xl font-bold text-[#68902b] mb-2">Welcome Back</h1>
          <p className="text-[#a3c75c] mb-6 text-center">
            Login to access your dashboard
          </p>
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <input
              type="email"
              required
              placeholder="Email address"
              className="w-full border border-[#dbc7a1] px-4 py-2 rounded-2xl focus:outline-[#68902b] bg-[#f6f3ee] text-base"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
            <input
              type="password"
              required
              placeholder="Password"
              className="w-full border border-[#dbc7a1] px-4 py-2 rounded-2xl focus:outline-[#68902b] bg-[#f6f3ee] text-base"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {errorMsg && (
              <div className="text-red-600 text-sm text-center mt-1">{errorMsg}</div>
            )}
            <BrandButton
              className="w-full justify-center mt-2"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </BrandButton>
          </form>
          <div className="text-sm text-center text-[#68902b] mt-6">
            Don&apos;t have an account?{' '}
            <a
              href="/register"
              className="underline hover:text-[#a3c75c] font-semibold"
            >
              Register here
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
