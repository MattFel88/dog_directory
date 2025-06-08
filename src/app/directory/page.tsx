'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import BrandButton from '../../components/BrandButton';
import { supabase } from '../../../lib/supabaseClient';

type Business = {
  id: string;
  name: string;
  category: string;
  description: string;
  phone?: string;
  email?: string;
  website?: string;
  area: string;
  created_at?: string;
  updated_at?: string;
};

export default function DirectoryPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBusinesses() {
      setLoading(true);
      const { data: businessData } = await supabase
        .from('businesses')
        .select('id, name, category, description, phone, email, website, area, created_at, updated_at');
      setBusinesses(businessData || []);
      setLoading(false);

      if (businessData && businessData.length > 0) {
        const uniqueCats = Array.from(new Set(businessData.map(b => b.category).filter(Boolean)));
        setCategories(uniqueCats);
      }
    }
    fetchBusinesses();
  }, []);

  const filtered = businesses.filter(b =>
    (category === 'All' || b.category === category) &&
    (b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.area && b.area.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold text-center mb-2 text-[#68902b]">Dog Service Directory</h1>
        <p className="text-center text-[#68902b] mb-10 max-w-2xl mx-auto text-lg">
          Discover trusted local dog service providers: walkers, groomers, trainers, sitters and more.
        </p>
        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center items-center">
          <input
            type="text"
            className="border border-[#dbc7a1] px-4 py-2 rounded-2xl shadow-sm focus:outline-[#68902b] w-full md:w-80 bg-white"
            placeholder="Search by business or area"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="border border-[#dbc7a1] px-4 py-2 rounded-2xl shadow-sm w-full md:w-60 bg-white"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20 text-2xl font-semibold text-[#68902b]">Loading directory...</div>
        ) : (
          <>
            {filtered.length === 0 ? (
              <div className="text-center text-[#68902b] py-20 text-lg">
                No businesses found matching your search/filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {filtered.map(biz => (
                  <BusinessCard key={biz.id} biz={biz} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

function BusinessCard({ biz }: { biz: Business }) {
  const [imgSrc, setImgSrc] = useState(
    `/category-icons/${biz.category.toLowerCase().replace(/ /g, '-')}.png`
  );

  return (
    <div className="flex flex-col bg-white border-2 border-[#dbc7a1] rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-200 p-6">
      <div className="flex flex-col items-center">
        <Image
          src={imgSrc}
          alt={biz.category}
          width={62}
          height={62}
          className="w-16 h-16 rounded-full object-cover border-4 border-[#a3c75c] mb-3 bg-[#f6f3ee]"
          onError={() => setImgSrc('/default-profile.png')}
        />
        <h2 className="text-2xl font-bold text-[#68902b] text-center mb-1">
          {biz.name}
        </h2>
        <div className="text-[#a3c75c] mb-2 text-center text-base">
          {biz.category}
        </div>
        <div className="text-gray-700 text-center mb-4 min-h-[48px] text-base">
          {biz.description ? biz.description.slice(0, 100) + (biz.description.length > 100 ? '...' : '') : 'No description provided.'}
        </div>
        <div className="text-[#68902b] text-sm mb-3">
          <span className="font-semibold">Area:</span> {biz.area}
        </div>
        <div className="flex flex-wrap gap-2 items-center justify-center mb-3">
          {biz.phone && (
            <a href={`tel:${biz.phone}`} className="text-[#68902b] underline text-sm hover:text-[#a3c75c]">
              {biz.phone}
            </a>
          )}
          {biz.email && (
            <a href={`mailto:${biz.email}`} className="text-[#68902b] underline text-sm hover:text-[#a3c75c]">
              {biz.email}
            </a>
          )}
          {biz.website && (
            <a href={biz.website} target="_blank" rel="noopener noreferrer" className="text-[#68902b] underline text-sm hover:text-[#a3c75c]">
              Website
            </a>
          )}
        </div>
        <div className="mt-3 w-full flex justify-center">
          <BrandButton
            className="w-full justify-center"
            onClick={() => window.open(biz.website || `mailto:${biz.email}`)}
          >
            Contact / Learn More
          </BrandButton>
        </div>
      </div>
    </div>
  );
}
