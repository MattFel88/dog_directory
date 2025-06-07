'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../../lib/authContext';

type Discount = {
  id: string;
  business_id: string;
  listing_ids: string[];
  title: string;
  description: string;
  code: string;
  active: boolean;
  created_at: string;
};

type Listing = {
  id: string;
  name: string;
  area: string;
};

export default function DiscountsPage() {
  const { user } = useAuth();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [listings, setListings] = useState<{ [id: string]: Listing }>({});
  const [isPaid, setIsPaid] = useState(false);

  // Get all discounts
  useEffect(() => {
    async function loadDiscounts() {
      const { data } = await supabase.from('discounts').select('*').eq('active', true).order('created_at', { ascending: false });
      setDiscounts(data || []);
    }
    loadDiscounts();
  }, []);

  // Get all listings referenced
  useEffect(() => {
    async function loadListings() {
      const allIds = Array.from(new Set(discounts.flatMap(d => d.listing_ids)));
      if (allIds.length === 0) return;
      const { data } = await supabase.from('businesses').select('id,name,area').in('id', allIds);
      const map: { [id: string]: Listing } = {};
      if (data) data.forEach((l: Listing) => (map[l.id] = l));
      setListings(map);
    }
    loadListings();
  }, [discounts]);

  // Check subscription status for current user
  useEffect(() => {
    async function checkSub() {
      if (!user) return setIsPaid(false);
      const { data } = await supabase.from('subscriptions').select('active').eq('user_id', user.id).eq('active', true).maybeSingle();
      setIsPaid(!!data);
    }
    checkSub();
  }, [user]);

  return (
    <>
      <Navbar />
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Available Discounts</h1>
        <p className="mb-6 text-gray-700">Unlock these exclusive discounts by becoming a member!</p>
        <div className="flex flex-col gap-6">
          {discounts.length === 0 && <div>No discounts yet.</div>}
          {discounts.map(discount => (
            <div key={discount.id} className="border rounded p-4 shadow bg-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold text-lg">{discount.title}</div>
                  <div className="text-gray-600">{discount.description}</div>
                  <div className="text-sm mt-2">
                    {discount.listing_ids.map(listingId =>
                      listings[listingId] ? (
                        <span key={listingId} className="bg-green-100 rounded px-2 py-1 mr-2">{listings[listingId].name} ({listings[listingId].area})</span>
                      ) : null
                    )}
                  </div>
                </div>
                <div className="mt-4 md:mt-0 md:ml-4 text-center">
                  {isPaid ? (
                    <span className="font-mono bg-green-600 text-white px-3 py-2 rounded text-lg">{discount.code}</span>
                  ) : (
                    <span className="font-mono bg-gray-200 text-gray-400 px-3 py-2 rounded text-lg select-none" title="Subscribe to unlock">
                      ******
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {!isPaid && (
          <div className="mt-8 p-4 bg-yellow-100 border rounded text-center">
            <span className="font-semibold">Want these codes?</span> <br />
            <span>Subscribe for instant access!</span>
            {/* Replace with real link/payment page */}
          </div>
        )}
      </main>
    </>
  );
}
