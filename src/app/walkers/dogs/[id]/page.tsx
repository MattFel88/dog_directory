'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../../../../components/Navbar';
import { supabase } from '../../../../../lib/supabaseClient';

type Dog = {
  id: string;
  name: string;
  breed?: string;
  age?: number;
  photo_url?: string;
  meet_and_greet_done?: boolean;
};

export default function DogProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [dog, setDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDog() {
      setLoading(true);
      const { data: dogData } = await supabase
        .from('dogs')
        .select('*')
        .eq('id', id)
        .single();
      setDog(dogData);
      setLoading(false);
    }
    if (id) fetchDog();
  }, [id]);

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-[#68902b] mb-8">Dog Profile</h1>
        {loading ? (
          <div className="text-center py-16 text-2xl text-[#68902b]">Loading...</div>
        ) : !dog ? (
          <div className="text-center text-lg text-[#68902b] py-16">Dog not found.</div>
        ) : (
          <div className="bg-white border-2 border-[#dbc7a1] rounded-3xl shadow-xl p-8 flex flex-col items-center">
            {dog.photo_url && (
              <Image
                src={dog.photo_url}
                alt={dog.name}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-[#a3c75c]"
                unoptimized
              />
            )}
            <div className="text-2xl font-bold text-[#68902b]">{dog.name}</div>
            <div className="mb-2">Breed: {dog.breed || 'Unknown'}</div>
            <div className="mb-2">Age: {dog.age ?? 'N/A'}</div>
            <div className="mb-2">Meet & Greet: {dog.meet_and_greet_done ? "✅" : "❌"}</div>
          </div>
        )}
      </main>
    </>
  );
}
