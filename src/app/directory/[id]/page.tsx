'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';
import Navbar from '../../../components/Navbar';

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

export default function BusinessProfilePage() {
  const params = useParams();
  const [business, setBusiness] = useState<Business | null>(null);

  useEffect(() => {
    async function loadBusiness() {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', params.id)
        .single();
      if (!error && data) setBusiness(data as Business);
    }
    if (params.id) loadBusiness();
  }, [params.id]);

  if (!business) return (
    <>
      <Navbar />
      <main className="p-6 max-w-2xl mx-auto">Loading business...</main>
    </>
  );

  return (
    <>
      <Navbar />
      <main className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold">{business.name}</h1>
        <div className="text-gray-700 mb-2">{business.category} · {business.area}</div>
        <p className="mb-4">{business.description}</p>
        {business.website && <div><a className="text-blue-700" href={business.website} target="_blank" rel="noopener noreferrer">{business.website}</a></div>}
        {business.email && <div>Email: {business.email}</div>}
        {business.phone && <div>Phone: {business.phone}</div>}
      </main>
    </>
  );
}
