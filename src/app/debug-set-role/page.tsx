'use client';
import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import Navbar from '../../components/Navbar';
import { useRouter } from 'next/navigation';

export default function DebugSetRolePage() {
  const [role, setRole] = useState<'customer' | 'business' | 'walker'>('customer');
  const [makeWalker, setMakeWalker] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  async function handleSetProfile(e: React.FormEvent) {
    e.preventDefault();
    setMessage('Working...');

    // 1. Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      setMessage('Could not get user: ' + authError.message);
      return;
    }
    if (!user) {
      setMessage('User not logged in.');
      return;
    }

    // 2. Update role in profiles table or insert if missing
    let profileUpdateMsg = '';
    const { data: updateData, error: profileError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', user.id)
      .select();
    if (profileError) {
      setMessage('Profile update failed: ' + profileError.message);
      return;
    }
    if (updateData && updateData.length > 0) {
      profileUpdateMsg = 'Profile updated. ';
    } else {
      // Try to insert if update did nothing
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ id: user.id, email: user.email, role }]);
      if (insertError) {
        setMessage('Profile row did not exist, and insert failed: ' + insertError.message);
        return;
      }
      profileUpdateMsg = 'Profile created. ';
    }

    // 3. If makeWalker is true, ensure walkers row exists, or create it
    let walkerMsg = '';
    if (makeWalker) {
      const { data: walker, error: selectError } = await supabase
        .from('walkers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (selectError) {
        setMessage(profileUpdateMsg + 'Walker select failed: ' + selectError.message);
        return;
      }
      if (!walker) {
        const defaultName = user.user_metadata?.full_name || user.email || 'Walker';
        const { error: walkerInsertError, data: walkerInsertData } = await supabase
          .from('walkers')
          .insert([{ user_id: user.id, name: defaultName }])
          .select()
          .single();
        if (walkerInsertError) {
          setMessage(profileUpdateMsg + 'Walker insert failed: ' + walkerInsertError.message);
          return;
        }
        walkerMsg = `Walker created with id ${walkerInsertData?.id}. `;
      } else {
        walkerMsg = 'Walker already exists. ';
      }
    }

    // 4. If subscribed, ensure subscriptions row exists and is active
    let subMsg = '';
    if (subscribed) {
      const { data: sub, error: subSelectError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (subSelectError) {
        setMessage(profileUpdateMsg + walkerMsg + 'Subscription select failed: ' + subSelectError.message);
        return;
      }
      if (!sub) {
        const { error: subInsertError, data: subInsertData } = await supabase
          .from('subscriptions')
          .insert([{ user_id: user.id, active: true }])
          .select()
          .single();
        if (subInsertError) {
          setMessage(profileUpdateMsg + walkerMsg + 'Subscription insert failed: ' + subInsertError.message);
          return;
        }
        subMsg = `Subscription created with id ${subInsertData?.id}. `;
      } else if (sub && !sub.active) {
        const { error: subUpdateError } = await supabase
          .from('subscriptions')
          .update({ active: true })
          .eq('id', sub.id);
        if (subUpdateError) {
          setMessage(profileUpdateMsg + walkerMsg + 'Subscription re-activate failed: ' + subUpdateError.message);
          return;
        }
        subMsg = 'Subscription re-activated. ';
      } else {
        subMsg = 'Already subscribed. ';
      }
    }

    setMessage(profileUpdateMsg + walkerMsg + subMsg || 'All done!');
  }

  return (
    <>
      <Navbar />
      <main className="p-6 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">Debug: Set My User Role & Status</h1>
        <form onSubmit={handleSetProfile} className="flex flex-col gap-4">
          <label className="font-semibold">
            Role
            <select
              className="border p-2 rounded ml-2"
              value={role}
              onChange={e => setRole(e.target.value as 'customer' | 'business' | 'walker')}
            >
              <option value="customer">Customer</option>
              <option value="business">Business</option>
              <option value="walker">Walker</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={makeWalker}
              onChange={e => setMakeWalker(e.target.checked)}
            />
            Create walker (add to walkers table)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={subscribed}
              onChange={e => setSubscribed(e.target.checked)}
            />
            Subscribed to discounts (add to subscriptions table)
          </label>
          <button className="bg-green-700 text-white p-2 rounded" type="submit">
            Set Profile
          </button>
        </form>
        {message && <p className="mt-2 break-words">{message}</p>}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-[#dbc7a1] text-[#68902b] px-4 py-2 rounded-full font-bold hover:bg-[#f6f3ee] transition"
          >
            Go to Customer Dashboard
          </button>
          <button
            onClick={() => router.push('/business/dashboard')}
            className="bg-[#68902b] text-white px-4 py-2 rounded-full font-bold hover:bg-[#a3c75c] transition"
          >
            Go to Business Dashboard
          </button>
          <button
            onClick={() => router.push('/walkers/dashboard')}
            className="bg-[#a3c75c] text-white px-4 py-2 rounded-full font-bold hover:bg-[#68902b] transition"
          >
            Go to Walker CRM
          </button>
        </div>
        <p className="text-xs mt-4">You can delete this page after you’ve fixed your users!</p>
      </main>
    </>
  );
}
