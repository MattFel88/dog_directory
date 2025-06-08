'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../../../components/Navbar';
import { supabase } from '../../../../lib/supabaseClient';

type Dog = {
  id: string;
  name: string;
  breed?: string;
  age?: number;
  photo_url?: string;
  meet_and_greet_done?: boolean;
};

export default function WalkersDogsPage() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDogs() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: walkerData } = await supabase
        .from('walkers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!walkerData) {
        setDogs([]);
        setLoading(false);
        return;
      }

      const { data: dogData } = await supabase
        .from('dogs')
        .select('*')
        .eq('walker_id', walkerData.id);

      setDogs(dogData || []);
      setLoading(false);
    }
    fetchDogs();
  }, []);

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-[#68902b] mb-8">Your Dogs</h1>
        {loading ? (
          <div className="text-center py-16 text-2xl text-[#68902b]">Loading...</div>
        ) : dogs.length === 0 ? (
          <div className="text-center text-lg text-[#68902b] py-16">No dogs found.</div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {dogs.map(dog => (
              <li key={dog.id} className="bg-[#f6f3ee] border-2 border-[#dbc7a1] rounded-xl p-4 flex items-center">
                {dog.photo_url && (
                  <Image
                    src={dog.photo_url}
                    alt={dog.name}
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-full object-cover mr-4 border-4 border-[#a3c75c]"
                    unoptimized
                  />
                )}
                <div>
                  <div className="font-bold text-lg text-[#68902b]">{dog.name}</div>
                  <div>Breed: {dog.breed || 'Unknown'}</div>
                  <div>Age: {dog.age ?? 'N/A'}</div>
                  <div>Meet & Greet: {dog.meet_and_greet_done ? "✅" : "❌"}</div>
                  <Link href={`/walkers/dogs/${dog.id}`} className="text-[#68902b] underline">Profile</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
