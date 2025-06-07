'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';
import Navbar from '../../../components/Navbar';
import Image from 'next/image';
import Link from 'next/link';

type Walker = {
  id: string;
  name: string;
  photo_url: string | null;
  about: string | null;
  insurance: string | null;
  qualifications: string | null;
};

type WalkBlock = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  start_time: string;
  end_time: string;
  is_group: boolean;
  capacity: number;
};

type Booking = {
  walk_block_id: string;
  status: string;
};

export default function WalkerProfile() {
  const params = useParams();
  const walkerId = typeof params.id === 'string' ? params.id : (Array.isArray(params.id) ? params.id[0] : '');

  const [walker, setWalker] = useState<Walker | null>(null);
  const [blocks, setBlocks] = useState<WalkBlock[]>([]);
  const [bookingCounts, setBookingCounts] = useState<{ [blockId: string]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walkerId) return;
    async function load() {
      setLoading(true);

      // Get walker details
      const { data: walkerData } = await supabase
        .from('walkers')
        .select('id, name, photo_url, about, insurance, qualifications')
        .eq('id', walkerId)
        .single();
      setWalker(walkerData);

      // Get walk blocks
      const { data: blockData } = await supabase
        .from('walk_blocks')
        .select('*')
        .eq('walker_id', walkerId)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      setBlocks(blockData || []);

      // Get number of approved bookings per block
      if (blockData && blockData.length) {
        const blockIds = blockData.map((b: WalkBlock) => b.id);
        const { data: bookingData } = await supabase
          .from('walker_bookings')
          .select('walk_block_id, status')
          .in('walk_block_id', blockIds);

        // Count approved bookings per block
        const counts: { [blockId: string]: number } = {};
        bookingData?.forEach((b: Booking) => {
          if (b.status === 'approved') {
            counts[b.walk_block_id] = (counts[b.walk_block_id] || 0) + 1;
          }
        });
        setBookingCounts(counts);
      }
      setLoading(false);
    }
    load();
  }, [walkerId]);

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto p-6">
        {loading && <div>Loading walker...</div>}
        {walker && (
          <div className="flex flex-col items-center border rounded-lg p-6 bg-white shadow mb-8">
            <Image
              src={walker.photo_url || '/default-profile.png'}
              alt={walker.name}
              width={120}
              height={120}
              className="w-32 h-32 rounded-full object-cover mb-4 border"
            />
            <h1 className="text-2xl font-bold mb-2">{walker.name}</h1>
            <div className="mb-2 text-center text-gray-700">{walker.about || "No bio provided."}</div>
            <div className="text-xs mb-1">
              <span className="font-semibold">Insurance:</span> {walker.insurance || "Not provided"}
            </div>
            <div className="text-xs mb-1">
              <span className="font-semibold">Qualifications:</span> {walker.qualifications || "Not provided"}
            </div>
          </div>
        )}

        <h2 className="text-xl font-bold mb-4 text-center">Available Walks</h2>
        <div className="flex flex-col gap-4">
          {blocks.length === 0 && !loading && (
            <div className="text-center text-gray-500">No walks scheduled yet.</div>
          )}
          {blocks.map(block => {
            const approved = bookingCounts[block.id] || 0;
            const available = block.capacity - approved;
            const statusColor = available > 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800';

            return (
              <Link
                key={block.id}
                href={`/walker-blocks/${block.id}`}
                className={`border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between bg-white shadow hover:shadow-lg transition cursor-pointer`}
              >
                <div>
                  <div className="font-semibold">{block.title}</div>
                  <div className="text-gray-600 text-sm">{block.description}</div>
                  <div className="text-xs text-gray-700">
                    {block.is_group ? 'Group walk' : 'Solo walk'} | {block.date} {block.start_time} - {block.end_time}
                  </div>
                </div>
                <div className={`mt-4 md:mt-0 md:ml-4 px-4 py-2 rounded-lg text-center text-sm font-bold ${statusColor}`}>
                  {available > 0
                    ? `${available} / ${block.capacity} slots available`
                    : 'Fully Booked'}
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
