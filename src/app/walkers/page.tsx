'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import BrandButton from '../../components/BrandButton';
import { supabase } from '../../../lib/supabaseClient';

type Walker = {
  id: string;
  name: string;
  photo_url: string | null;
  about: string | null;
  area: string | null;
};

type GroupWalkCount = {
  [walkerId: string]: number;
};

export default function WalkersDirectoryPage() {
  const [walkers, setWalkers] = useState<Walker[]>([]);
  const [filteredWalkers, setFilteredWalkers] = useState<Walker[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [areaFilter, setAreaFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [walkCounts, setWalkCounts] = useState<GroupWalkCount>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWalkers() {
      setLoading(true);
      // Fetch all approved walkers
      const { data: walkerData } = await supabase
        .from('walkers')
        .select('id, name, photo_url, about, area')
        .eq('approved', true);

      setWalkers(walkerData || []);

      // Collect unique areas for filter dropdown
      const uniqueAreas = Array.from(new Set((walkerData || []).map(w => w.area).filter(Boolean)));
      setAreas(uniqueAreas);

      // Get group walk counts for each walker
      if (walkerData && walkerData.length > 0) {
        const { data: walks } = await supabase
          .from('walk_blocks')
          .select('id, walker_id')
          .eq('is_group', true)
          .gte('date', new Date().toISOString().split('T')[0]);

        const counts: GroupWalkCount = {};
        (walks || []).forEach(walk => {
          const walkerId = walk.walker_id;
          if (walkerId) {
            counts[walkerId] = (counts[walkerId] || 0) + 1;
          }
        });
        setWalkCounts(counts);
      }

      setLoading(false);
    }

    fetchWalkers();
  }, []);

  useEffect(() => {
    // Filter by area and search
    let list = walkers;
    if (areaFilter !== 'All') {
      list = list.filter(w => w.area === areaFilter);
    }
    if (search.trim() !== '') {
      const term = search.trim().toLowerCase();
      list = list.filter(w => w.name.toLowerCase().includes(term) || (w.area && w.area.toLowerCase().includes(term)));
    }
    setFilteredWalkers(list);
  }, [walkers, areaFilter, search]);

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold text-center mb-2 text-[#68902b]">Find a Trusted Dog Walker</h1>
        <p className="text-center text-[#68902b] mb-10 max-w-2xl mx-auto text-lg">
          All walkers are carefully selected for professionalism, safety, and ethics.<br />
          Search below to find your perfect local dog walker.
        </p>

        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center items-center">
          <input
            type="text"
            className="border border-[#dbc7a1] px-4 py-2 rounded-2xl shadow-sm focus:outline-[#68902b] w-full md:w-80 bg-white"
            placeholder="Search by name or area"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="border border-[#dbc7a1] px-4 py-2 rounded-2xl shadow-sm w-full md:w-60 bg-white"
            value={areaFilter}
            onChange={e => setAreaFilter(e.target.value)}
          >
            <option value="All">All Areas</option>
            {areas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20 text-2xl font-semibold text-[#68902b]">Loading walkers...</div>
        ) : (
          <>
            {filteredWalkers.length === 0 ? (
              <div className="text-center text-[#68902b] py-20 text-lg">
                No walkers found matching your search/filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredWalkers.map(walker => (
                  <div key={walker.id} className="flex flex-col bg-white border-2 border-[#dbc7a1] rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-200 p-6 relative">
                    <Link href={`/walkers/${walker.id}`}>
                      <div className="flex flex-col items-center">
                        <Image
                          src={walker.photo_url || '/default-profile.png'}
                          alt={walker.name}
                          width={110}
                          height={110}
                          className="w-28 h-28 rounded-full object-cover border-4 border-[#a3c75c] mb-4 bg-[#f6f3ee]"
                        />
                        <h2 className="text-2xl font-bold text-[#68902b] text-center mb-1">
                          {walker.name}
                        </h2>
                        <div className="text-[#a3c75c] mb-2 text-center text-base">{walker.area || 'Area not set'}</div>
                        <div className="text-gray-700 text-center mb-4 min-h-[48px] text-base">
                          {walker.about ? walker.about.slice(0, 80) + (walker.about.length > 80 ? '...' : '') : 'No bio provided.'}
                        </div>
                        <div className="flex gap-2 items-center mt-auto">
                          <span className="inline-block bg-[#f6f3ee] text-[#68902b] px-3 py-1 rounded-full text-xs font-semibold border border-[#dbc7a1]">
                            {walkCounts[walker.id] || 0} Upcoming Group Walk{walkCounts[walker.id] === 1 ? '' : 's'}
                          </span>
                        </div>
                        <div className="mt-6 w-full flex justify-center">
                          <BrandButton className="w-full justify-center">
                            View Profile
                          </BrandButton>
                        </div>
                      </div>
                    </Link>
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
