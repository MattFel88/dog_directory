'use client';
import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import Navbar from '../../components/Navbar';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [message, setMessage] = useState('');

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role } // <--- critical for dashboards
      }
    });
    setMessage(error ? error.message : 'Check your email for confirmation.');
  }

  return (
    <>
      <Navbar />
      <main className="p-6 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">Sign Up</h1>
        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
          <input
            className="border p-2 rounded"
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} required
          />
          <input
            className="border p-2 rounded"
            type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} required
          />
          <select
            className="border p-2 rounded"
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="customer">Customer</option>
            <option value="business">Business</option>
          </select>
          <button className="bg-green-700 text-white p-2 rounded" type="submit">
            Sign Up
          </button>
        </form>
        {message && <p className="mt-2">{message}</p>}
      </main>
    </>
  );
}
