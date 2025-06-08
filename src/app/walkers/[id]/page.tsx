'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../../../components/Navbar';

type Walker = {
  id: string;
  name: string;
  photo_url: string | null;
  about: string | null;
  insurance: string | null;
  qualifications: string | null;
};

type Dog = {
  id: string;
  name: string;
  breed: string | null;
  age: number | null;
  photo_url: string | null;
};

type WalkerBookingApi = {
  dog_id: string;
  dogs: Dog[];
};

type GroupWalkApi = {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  walker_bookings?: WalkerBookingApi[];
};

type GroupWalk = {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  dogs: Dog[];
};

export default function WalkerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [walker, setWalker] = useState<Walker | null>(null);
  const [groupWalks, setGroupWalks] = useState<GroupWalk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWalker() {
      setLoading(true);

      // Fetch walker profile
      const { data: walkerData } = await supabase
        .from('walkers')
        .select('id, name, photo_url, about, insurance, qualifications')
        .eq('id', id)
        .single();

      setWalker(walkerData);

      // Fetch future group walks for this walker
      const { data: walksData } = await supabase
        .from('walk_blocks')
        .select(
          `
            id, 
            title, 
            date, 
            start_time, 
            end_time, 
            is_group,
            walker_id,
            walker_bookings (
              dog_id,
              dogs (
                id, name, breed, age, photo_url
              )
            )
          `
        )
        .eq('walker_id', id)
        .eq('is_group', true)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });

      // Flatten all dogs from all bookings for each walk
      const groupWalksWithDogs: GroupWalk[] = (walksData as GroupWalkApi[] || []).map(walk => {
        const dogs: Dog[] = [];
        if (walk.walker_bookings && Array.isArray(walk.walker_bookings)) {
          walk.walker_bookings.forEach(booking => {
            if (booking.dogs && Array.isArray(booking.dogs)) {
              booking.dogs.forEach(dog => dogs.push(dog));
            }
          });
        }
        return {
          id: walk.id,
          title: walk.title,
          date: walk.date,
          start_time: walk.start_time,
          end_time: walk.end_time,
          dogs,
        };
      });

      setGroupWalks(groupWalksWithDogs);
      setLoading(false);
    }

    loadWalker();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center text-xl">Loading walker profile...</div>
        </main>
      </>
    );
  }

  if (!walker) {
    return (
      <>
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center text-xl text-red-600">
            Walker not found.
          </div>
          <div className="text-center mt-8">
            <Link href="/walkers" className="text-blue-600 underline">
              Back to all walkers
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/walkers" className="text-blue-600 underline text-sm">&larr; Back to all walkers</Link>

        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center mt-4">
          <Image
            src={walker.photo_url || '/default-profile.png'}
            alt={walker.name}
            width={160}
            height={160}
            className="w-40 h-40 rounded-full object-cover border-4 border-green-200 shadow mb-6"
          />
          <h1 className="text-3xl font-bold mb-1">{walker.name}</h1>
          <div className="text-gray-600 mb-4 text-center max-w-xl">{walker.about || 'No bio provided.'}</div>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full justify-center">
            <div className="bg-green-50 px-4 py-2 rounded shadow text-sm">
              <span className="font-semibold">Insurance:</span> {walker.insurance || 'Not provided'}
            </div>
            <div className="bg-green-50 px-4 py-2 rounded shadow text-sm">
              <span className="font-semibold">Qualifications:</span> {walker.qualifications || 'Not provided'}
            </div>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-bold mb-4 text-center">Upcoming Group Walks</h2>
          {groupWalks.length === 0 ? (
            <div className="text-center text-gray-500">No upcoming group walks for this walker.</div>
          ) : (
            <div className="flex flex-col gap-6">
              {groupWalks.map(walk => (
                <div key={walk.id} className="bg-white rounded-xl shadow p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-center mb-2">
                    <div>
                      <div className="text-lg font-semibold">{walk.title}</div>
                      <div className="text-gray-500 text-sm">
                        {walk.date} &bull; {walk.start_time} - {walk.end_time}
                      </div>
                    </div>
                    <div className="text-sm bg-green-100 text-green-900 px-4 py-1 rounded mt-2 sm:mt-0">
                      {walk.dogs.length} dogs in group
                    </div>
                  </div>
                  {walk.dogs.length > 0 ? (
                    <ul className="flex flex-wrap gap-4 mt-2">
                      {walk.dogs.map(dog => (
                        <li key={dog.id} className="flex flex-col items-center border p-2 rounded-xl bg-green-50">
                          <Image
                            src={dog.photo_url || '/dog-avatar.png'}
                            alt={dog.name}
                            width={60}
                            height={60}
                            className="w-16 h-16 rounded-full object-cover mb-2 border"
                          />
                          <span className="font-bold">{dog.name}</span>
                          <span className="text-xs text-gray-600">{dog.breed || 'Breed N/A'}</span>
                          <span className="text-xs text-gray-500">{dog.age ? `${dog.age} years` : 'Age N/A'}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-500 text-sm mt-2">No dogs registered for this walk yet.</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="mt-10 flex justify-center">
          <a
            href={`mailto:info@paws-itivitydogs.co.uk?subject=Booking enquiry for ${walker.name}`}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-2xl shadow text-lg transition"
          >
            Request Booking / Contact Walker
          </a>
        </div>
      </main>
    </>
  );
}
