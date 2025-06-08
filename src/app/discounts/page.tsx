'use client';
import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import BrandButton from '../../components/BrandButton';
import { supabase } from '../../../lib/supabaseClient';

type Discount = {
  id: string;
  business_id: string;
  title: string;
  description: string;
  code: string;
  active: boolean;
  expires_at?: string;
  business?: {
    name?: string;
    website?: string;
  };
};

// Supabase returns business as an array, so we type that
type DiscountRaw = Discount & {
  business: { name?: string; website?: string }[];
};

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDiscounts() {
      setLoading(true);
      // Get active discounts, join to business name
      const { data } = await supabase
        .from('discounts')
        .select(`
          id, business_id, title, description, code, active, expires_at,
          business:business_id (name, website)
        `)
        .eq('active', true)
        .order('expires_at', { ascending: true });

      // Map: business as array to single object for our component
      const normalised = (data || []).map((d: DiscountRaw) => ({
        ...d,
        business: Array.isArray(d.business) ? d.business[0] : d.business,
      }));
      setDiscounts(normalised);
      setLoading(false);
    }
    fetchDiscounts();
  }, []);

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold text-center mb-2 text-[#68902b]">Exclusive Discounts</h1>
        <p className="text-center text-[#68902b] mb-10 max-w-2xl mx-auto text-lg">
          Enjoy special offers from our approved local partners. All discounts are verified, limited, and exclusive to our community!
        </p>

        {loading ? (
          <div className="text-center py-20 text-2xl font-semibold text-[#68902b]">Loading discounts...</div>
        ) : (
          <>
            {discounts.length === 0 ? (
              <div className="text-center text-[#68902b] py-20 text-lg">
                No active discounts available right now. Check back soon!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {discounts.map(discount => (
                  <div key={discount.id} className="bg-white border-2 border-[#dbc7a1] rounded-3xl shadow-xl flex flex-col items-center p-8">
                    <div className="w-full flex flex-col items-center mb-4">
                      <div className="text-2xl font-bold text-[#68902b] text-center mb-1">
                        {discount.title}
                      </div>
                      <div className="text-[#a3c75c] mb-2 text-center text-base font-semibold">
                        {discount.business?.name || 'Business'}
                      </div>
                      <div className="text-gray-700 text-center mb-3 text-base min-h-[48px]">
                        {discount.description}
                      </div>
                      {discount.expires_at && (
                        <div className="text-sm text-[#68902b] mb-3">
                          <span className="font-semibold">Expires: </span>
                          {new Date(discount.expires_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="w-full flex flex-col items-center gap-3">
                      <div className="text-xl font-mono bg-[#f6f3ee] border-2 border-[#a3c75c] rounded-full px-6 py-2 text-[#68902b] tracking-wider mb-2 select-all">
                        {discount.code}
                      </div>
                      <BrandButton
                        className="w-full justify-center"
                        onClick={() => handleCopy(discount.code)}
                      >
                        {copied === discount.code ? 'Copied!' : 'Copy Discount Code'}
                      </BrandButton>
                      {discount.business?.website && (
                        <a
                          href={discount.business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 text-[#68902b] underline text-base hover:text-[#a3c75c]"
                        >
                          Visit Partner Website &rarr;
                        </a>
                      )}
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
