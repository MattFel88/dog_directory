'use client';
import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import Navbar from '../../components/Navbar';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
    } else if (data?.user) {
      setMessage('Logged in!');
      // Get the user's role from metadata
      const userRole = data.user.user_metadata?.role;
      if (userRole === 'business') {
        router.push('/dashboard/business');
      } else {
        router.push('/dashboard/customer');
      }
    } else {
      setMessage('Login successful, but no user data found.');
    }
  }

  return (
    <>
      <Navbar />
      <main className="p-6 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">Sign In</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            className="border p-2 rounded"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="border p-2 rounded"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button className="bg-green-700 text-white p-2 rounded" type="submit">
            Sign In
          </button>
        </form>
        {message && <p className="mt-2">{message}</p>}
      </main>
    </>
  );
}
