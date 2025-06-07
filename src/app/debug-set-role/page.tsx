'use client';
import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import Navbar from '../../components/Navbar';

export default function DebugSetRolePage() {
  const [role, setRole] = useState('customer');
  const [message, setMessage] = useState('');

  async function handleSetRole(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({
      data: { role }
    });
    setMessage(error ? error.message : `Role set to "${role}"!`);
  }

  return (
    <>
      <Navbar />
      <main className="p-6 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">Debug: Set My User Role</h1>
        <form onSubmit={handleSetRole} className="flex flex-col gap-4">
          <select
            className="border p-2 rounded"
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="customer">Customer</option>
            <option value="business">Business</option>
          </select>
          <button className="bg-green-700 text-white p-2 rounded" type="submit">
            Set My Role
          </button>
        </form>
        {message && <p className="mt-2">{message}</p>}
        <p className="text-xs mt-4">You can delete this page after you’ve fixed your users!</p>
      </main>
    </>
  );
}
