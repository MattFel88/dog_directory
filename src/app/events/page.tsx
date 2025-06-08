'use client';
import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import BrandButton from '../../components/BrandButton';
import { supabase } from '../../../lib/supabaseClient';

type Event = {
  id: string;
  business_id: string;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  capacity?: number;
  business?: {
    name?: string;
    website?: string;
  };
};

// Supabase returns business as an array
type EventRaw = Event & {
  business: { name?: string; website?: string }[];
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      const { data } = await supabase
        .from('events')
        .select(`
          id, business_id, title, description, location, start_time, end_time, capacity,
          business:business_id (name, website)
        `)
        .gte('end_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      // Normalize business
      const normalised = (data || []).map((e: EventRaw) => ({
        ...e,
        business: Array.isArray(e.business) ? e.business[0] : e.business,
      }));
      setEvents(normalised);
      setLoading(false);
    }
    fetchEvents();
  }, []);

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold text-center mb-2 text-[#68902b]">Upcoming Events</h1>
        <p className="text-center text-[#68902b] mb-10 max-w-2xl mx-auto text-lg">
          Fun, friendly, and useful events from our trusted partners. Everyone is welcome!
        </p>

        {loading ? (
          <div className="text-center py-20 text-2xl font-semibold text-[#68902b]">Loading events...</div>
        ) : (
          <>
            {events.length === 0 ? (
              <div className="text-center text-[#68902b] py-20 text-lg">
                No upcoming events at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {events.map(event => (
                  <div
                    key={event.id}
                    className="bg-white border-2 border-[#dbc7a1] rounded-3xl shadow-xl flex flex-col items-center p-8"
                  >
                    <div className="w-full flex flex-col items-center mb-4">
                      <div className="text-2xl font-bold text-[#68902b] text-center mb-1">
                        {event.title}
                      </div>
                      <div className="text-[#a3c75c] mb-2 text-center text-base font-semibold">
                        {event.business?.name || 'Partner'}
                      </div>
                      <div className="text-gray-700 text-center mb-3 text-base min-h-[48px]">
                        {event.description}
                      </div>
                      <div className="flex flex-col items-center mb-2">
                        <div className="text-[#68902b] text-sm mb-1">
                          <span className="font-semibold">Date:</span>{' '}
                          {new Date(event.start_time).toLocaleDateString()} {' '}
                          {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[#68902b] text-sm mb-1">
                          <span className="font-semibold">Location:</span> {event.location}
                        </div>
                        {event.capacity && (
                          <div className="text-[#68902b] text-sm mb-1">
                            <span className="font-semibold">Spaces:</span> {event.capacity}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-full flex flex-col items-center gap-3">
                      <BrandButton
                        className="w-full justify-center"
                        onClick={() =>
                          event.business?.website
                            ? window.open(event.business.website, '_blank')
                            : undefined
                        }
                      >
                        {event.business?.website ? 'Learn More / Book' : 'Contact Partner'}
                      </BrandButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
