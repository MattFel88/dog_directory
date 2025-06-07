'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Image from 'next/image';


type Walker = {
  id: string;
  name: string;
  photo_url: string | null;
  about: string | null;
  insurance: string | null;
  qualifications: string | null;
};

export default function WalkersDirectory() {
  const [walkers, setWalkers] = useState<Walker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWalkers() {
      setLoading(true);
      const { data } = await supabase
        .from('walkers')
        .select('id, name, photo_url, about, insurance, qualifications')
        .eq('approved', true)
        .order('created_at', { ascending: false });

      if (data) setWalkers(data);
      setLoading(false);
    }
    loadWalkers();
  }, []);

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Meet Our Dog Walkers</h1>
        {loading && <div className="text-center">Loading walkers...</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {walkers.length === 0 && !loading && (
            <div className="col-span-2 text-center text-gray-500">No walkers available yet. Check back soon!</div>
          )}
          {walkers.map(walker => (
            <div key={walker.id} className="border rounded-lg p-6 bg-white shadow flex flex-col items-center">
                <Image
                    src={walker.photo_url || '/default-profile.png'}
                    alt={walker.name}
                    width={112}
                    height={112}
                    className="w-28 h-28 rounded-full object-cover mb-4 border"
                />

              <h2 className="text-xl font-bold mb-2">{walker.name}</h2>
              <div className="mb-2 text-sm text-gray-700">{walker.about?.substring(0, 80) || "No bio provided."}</div>
              <div className="mb-2 text-xs text-gray-600">
                <span className="font-semibold">Insurance: </span>
                {walker.insurance || "Not provided"}
              </div>
              <div className="mb-4 text-xs text-gray-600">
                <span className="font-semibold">Qualifications: </span>
                {walker.qualifications || "Not provided"}
              </div>
              <Link
                href={`/walkers/${walker.id}`}
                className="inline-block bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
