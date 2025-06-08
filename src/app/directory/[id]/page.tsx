'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../../../components/Navbar';
import BrandButton from '../../../components/BrandButton';
import { supabase } from '../../../../lib/supabaseClient';

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

export default function BusinessProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBusiness() {
      setLoading(true);
      const { data } = await supabase
        .from('businesses')
        .select('id, name, category, description, phone, email, website, area, created_at, updated_at')
        .eq('id', id)
        .single();
      setBusiness(data);
      setImgSrc(
        data
          ? `/category-icons/${data.category.toLowerCase().replace(/ /g, '-')}.png`
          : '/default-profile.png'
      );
      setLoading(false);
    }
    if (id) fetchBusiness();
  }, [id]);

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <button
          onClick={() => router.back()}
          className="mb-6 text-[#68902b] underline hover:text-[#a3c75c] text-base"
        >
          &larr; Back to Directory
        </button>
        {loading ? (
          <div className="text-center text-2xl text-[#68902b] py-24">Loading business profile...</div>
        ) : !business ? (
          <div className="text-center text-lg text-[#68902b] py-20">Business not found.</div>
        ) : (
          <div className="bg-white border-2 border-[#dbc7a1] rounded-3xl shadow-xl p-8 flex flex-col items-center">
            <Image
              src={imgSrc!}
              alt={business.category}
              width={92}
              height={92}
              className="w-24 h-24 rounded-full object-cover border-4 border-[#a3c75c] mb-4 bg-[#f6f3ee]"
              onError={() => setImgSrc('/default-profile.png')}
            />
            <h1 className="text-3xl font-bold text-[#68902b] mb-2 text-center">{business.name}</h1>
            <div className="text-[#a3c75c] text-lg font-semibold mb-3 text-center">{business.category}</div>
            <div className="text-gray-700 text-center mb-4 text-base">{business.description}</div>
            <div className="mb-2 text-[#68902b] text-base">
              <span className="font-semibold">Area:</span> {business.area}
            </div>
            <div className="flex flex-wrap gap-4 items-center justify-center mb-6">
              {business.phone && (
                <a href={`tel:${business.phone}`} className="text-[#68902b] underline text-base hover:text-[#a3c75c]">
                  {business.phone}
                </a>
              )}
              {business.email && (
                <a href={`mailto:${business.email}`} className="text-[#68902b] underline text-base hover:text-[#a3c75c]">
                  {business.email}
                </a>
              )}
              {business.website && (
                <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-[#68902b] underline text-base hover:text-[#a3c75c]">
                  Website
                </a>
              )}
            </div>
            <div className="mt-4 w-full flex justify-center">
              <BrandButton
                className="w-full justify-center"
                onClick={() =>
                  business.website
                    ? window.open(business.website, '_blank')
                    : business.email
                    ? window.open(`mailto:${business.email}`)
                    : business.phone
                    ? window.open(`tel:${business.phone}`)
                    : undefined
                }
              >
                Contact / Learn More
              </BrandButton>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
