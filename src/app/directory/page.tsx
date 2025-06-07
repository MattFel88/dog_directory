'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

type Business = {
  id: string;
  name: string;
  category: string;
  description: string;
  phone?: string;
  email?: string;
  website?: string;
  area: string;
};

export default function DirectoryPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState<Business[]>([]);

  useEffect(() => {
    async function loadBusinesses() {
      const { data, error } = await supabase.from('businesses').select('*').order('name');
      if (!error && data) setBusinesses(data as Business[]);
    }
    loadBusinesses();
  }, []);

  useEffect(() => {
    if (!search) setFiltered(businesses);
    else {
      setFiltered(
        businesses.filter(b =>
          b.name.toLowerCase().includes(search.toLowerCase()) ||
          b.area.toLowerCase().includes(search.toLowerCase()) ||
          b.category.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, businesses]);

  return (
    <>
      <Navbar />
      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dog Business Directory</h1>
        <input
          className="border rounded p-2 mb-6 w-full"
          placeholder="Search by name, area or category"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.length === 0 && (
            <p>No businesses found.</p>
          )}
          {filtered.map(b => (
            <Link href={`/directory/${b.id}`} key={b.id} className="block border rounded p-4 shadow hover:shadow-lg bg-white">
              <h2 className="font-bold text-lg">{b.name}</h2>
              <div className="text-sm text-gray-600">{b.category} · {b.area}</div>
              <p className="mt-2">{b.description.substring(0, 120)}...</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
