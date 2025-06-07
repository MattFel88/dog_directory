'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';
import Navbar from '../../../components/Navbar';
import Image from 'next/image';

// Types
type WalkBlock = {
  id: string;
  walker_id: string;
  title: string;
  description: string | null;
  date: string;
  start_time: string;
  end_time: string;
  is_group: boolean;
  capacity: number;
};

type Dog = {
  id: string;
  name: string;
  breed: string | null;
  age: number | null;
  photo_url: string | null;
  walker_id?: string;
  meet_and_greet_done?: boolean;
};

type Booking = {
  id: string;
  customer_id: string;
  dog_id: string;
  status: string;
  dogs: Dog[]; // Array for 1:N join
};

type Walker = {
  id: string;
  name: string;
  photo_url: string | null;
};

type User = {
  id: string;
  email: string;
};

export default function WalkBlockDetail() {
  const params = useParams();
  const blockId =
    typeof params.blockId === 'string'
      ? params.blockId
      : Array.isArray(params.blockId)
      ? params.blockId[0]
      : '';

  const [walk, setWalk] = useState<WalkBlock | null>(null);
  const [walker, setWalker] = useState<Walker | null>(null);
  const [pack, setPack] = useState<Booking[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [myDogs, setMyDogs] = useState<Dog[]>([]);
  const [selectedDogId, setSelectedDogId] = useState<string>(''); // Always a string!
  const [hasMeetAndGreet, setHasMeetAndGreet] = useState(false);
  const [myBooking, setMyBooking] = useState<Booking | null>(null);
  const [slotsAvailable, setSlotsAvailable] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bookingMessage, setBookingMessage] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);

      // 1. Get walk block info
      const { data: walk } = await supabase
        .from('walk_blocks')
        .select('*')
        .eq('id', blockId)
        .single();
      setWalk(walk);

      // 2. Get walker info
      if (walk) {
        const { data: walker } = await supabase
          .from('walkers')
          .select('id, name, photo_url')
          .eq('id', walk.walker_id)
          .single();
        setWalker(walker);
      }

      // 3. Get all approved bookings for this walk, including dog details
      const { data: bookings } = await supabase
        .from('walker_bookings')
        .select('id, customer_id, dog_id, status, dogs(id, name, breed, age, photo_url)')
        .eq('walk_block_id', blockId)
        .eq('status', 'approved');
      setPack(bookings || []);
      setSlotsAvailable(walk ? walk.capacity - (bookings?.length || 0) : 0);

      // 4. Get logged in user
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' });
      } else {
        setUser(null);
      }

      // 5. If logged in and not walker, get their dogs and meet & greet status
      if (session?.user && walk && session.user.id !== walk.walker_id) {
        // Get all their dogs
        const { data: dogs } = await supabase
          .from('dogs')
          .select('id, name, breed, age, photo_url, meet_and_greet_done, walker_id')
          .eq('owner_id', session.user.id);
        setMyDogs(dogs || []);

        // Check if any dog has meet and greet done with this walker
        const hasMAndG = (dogs || []).some(
          (dog: Dog) =>
            dog.walker_id === walk.walker_id && dog.meet_and_greet_done === true
        );
        setHasMeetAndGreet(hasMAndG);

        // Check if user already has a booking for this walk
        const { data: myBooking } = await supabase
          .from('walker_bookings')
          .select('id, customer_id, dog_id, status, dogs(id, name, breed, age, photo_url)')
          .eq('walk_block_id', blockId)
          .eq('customer_id', session.user.id)
          .single();
        setMyBooking(myBooking || null);
      }

      setLoading(false);
    }
    load();
  }, [blockId]);

  // Handle booking request
  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDogId || !user) return;

    setBookingMessage('Sending booking request...');
    const { error } = await supabase.from('walker_bookings').insert({
      walk_block_id: blockId,
      customer_id: user.id,
      dog_id: selectedDogId,
      status: 'pending'
    });

    if (!error) {
      setBookingMessage('Booking request sent! Wait for walker approval.');
      setSelectedDogId(''); // clear selection after request
    } else {
      setBookingMessage('Booking failed. Please try again.');
    }
  }

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto p-6">
        {loading && <div>Loading walk info...</div>}

        {walk && walker && (
          <div className="border rounded-lg p-6 mb-8 bg-white shadow">
            <h1 className="text-xl font-bold mb-1">{walk.title}</h1>
            <div className="text-gray-700 text-sm mb-1">{walk.description}</div>
            <div className="text-xs mb-2">
              <span className="font-semibold">Walker:</span> {walker.name}
            </div>
            <div className="text-xs mb-2">
              <span className="font-semibold">Date:</span> {walk.date} | {walk.start_time} - {walk.end_time}
            </div>
            <div className="text-xs mb-2">
              <span className="font-semibold">Type:</span> {walk.is_group ? 'Group walk' : 'Solo walk'}
            </div>
            <div className="text-xs mb-2">
              <span className="font-semibold">Slots available:</span>{' '}
              <span className={slotsAvailable > 0 ? 'text-green-700' : 'text-red-700'}>
                {slotsAvailable > 0
                  ? `${slotsAvailable} of ${walk.capacity}`
                  : 'Fully Booked'}
              </span>
            </div>
          </div>
        )}

        {walk?.is_group && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Current Pack</h2>
            <div className="flex flex-wrap gap-4">
              {pack.length === 0 && <div className="text-gray-500">No dogs yet in this group.</div>}
              {pack.map(b => (
                <div key={b.dogs[0]?.id || b.id} className="flex flex-col items-center border rounded p-2 bg-gray-50 w-32">
                  <Image
                    src={b.dogs[0]?.photo_url || '/default-profile.png'}
                    alt={b.dogs[0]?.name || 'Dog'}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover mb-1 border"
                  />
                  <div className="text-xs font-bold">{b.dogs[0]?.name}</div>
                  <div className="text-xs text-gray-600">{b.dogs[0]?.breed || 'Breed N/A'}</div>
                  <div className="text-xs text-gray-600">{b.dogs[0]?.age ? `${b.dogs[0]?.age} yrs` : ''}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booking logic */}
        {user && walk && user.id !== walk.walker_id && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Request a Booking</h3>
            {slotsAvailable === 0 && (
              <div className="text-red-700 mb-2">Sorry, this walk is fully booked.</div>
            )}
            {!hasMeetAndGreet && (
              <div className="text-orange-700 mb-2">
                You must complete a meet & greet with this walker before booking.
              </div>
            )}
            {myBooking && (
              <div className="mb-2 text-blue-700">
                You already have a booking for this walk ({myBooking.status}).
              </div>
            )}
            {slotsAvailable > 0 && hasMeetAndGreet && !myBooking && (
              <form onSubmit={handleBooking} className="flex flex-col gap-2">
                <label className="text-sm">Select your dog:</label>
                <select
                  className="border rounded p-2"
                  value={selectedDogId} // Always a string!
                  onChange={e => setSelectedDogId(e.target.value)}
                  required
                >
                  <option value="">-- Select Dog --</option>
                  {myDogs.map(dog => (
                    <option key={dog.id} value={dog.id}>
                      {dog.name} ({dog.breed || 'Breed N/A'})
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 mt-2"
                  disabled={!selectedDogId}
                >
                  Request Booking
                </button>
                {bookingMessage && <div className="text-xs text-blue-700 mt-1">{bookingMessage}</div>}
              </form>
            )}
          </div>
        )}

        {!user && (
          <div className="mt-6 text-center">
            <span className="text-blue-700">Please log in to request a booking.</span>
          </div>
        )}
      </main>
    </>
  );
}
