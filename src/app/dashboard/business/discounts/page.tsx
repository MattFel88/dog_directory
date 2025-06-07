'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../../../lib/authContext';
import { supabase } from '../../../../../lib/supabaseClient';
import Navbar from '../../../../components/Navbar';

type Listing = {
  id: string;
  name: string;
};

type Discount = {
  id: string;
  title: string;
  description: string;
  code: string;
  listing_ids: string[];
  active: boolean;
  created_at: string;
};

const emptyForm = {
  title: "",
  description: "",
  code: "",
  listing_ids: [] as string[],
};

export default function BusinessDiscountsManager() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  // Load business's listings and discounts
  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data: listingsData } = await supabase.from('businesses').select('id, name').eq('user_id', user.id);
      setListings(listingsData || []);
      const { data: discountsData } = await supabase.from('discounts').select('*').eq('business_id', user.id).order('created_at', { ascending: false });
      setDiscounts(discountsData || []);
    }
    load();
  }, [user]);

  // Reset form when done editing/creating
  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleEdit(discount: Discount) {
    setEditingId(discount.id);
    setForm({
      title: discount.title,
      description: discount.description,
      code: discount.code,
      listing_ids: discount.listing_ids,
    });
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this discount?")) return;
    const { error } = await supabase.from('discounts').delete().eq('id', id);
    if (error) setMessage(error.message);
    else {
      setDiscounts(discounts.filter(d => d.id !== id));
      if (editingId === id) resetForm();
      setMessage("Discount deleted.");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setMessage("Saving...");
    if (editingId) {
      // Update
      const { error } = await supabase.from('discounts').update({ ...form }).eq('id', editingId);
      if (error) setMessage(error.message);
      else {
        setDiscounts(discounts.map(d => d.id === editingId ? { ...d, ...form } : d));
        setMessage("Discount updated!");
        resetForm();
      }
    } else {
      // Create
      const { error, data } = await supabase.from('discounts').insert([{ ...form, business_id: user.id }]).select().single();
      if (error) setMessage(error.message);
      else {
        setDiscounts([data, ...discounts]);
        setMessage("Discount created!");
        resetForm();
      }
    }
  }

  return (
    <>
      <Navbar />
      <main className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Manage Discounts</h1>
        {/* Create/Edit Discount */}
        <form onSubmit={handleSave} className="flex flex-col gap-4 border rounded p-4 mb-6 bg-white shadow">
          <h2 className="font-bold">{editingId ? "Edit Discount" : "Create Discount"}</h2>
          <input className="border p-2 rounded" placeholder="Discount Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          <textarea className="border p-2 rounded" placeholder="Discount Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
          <input className="border p-2 rounded font-mono" placeholder="Discount Code" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required />
          <div>
            <label className="font-semibold">Select Listings:</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {listings.map(listing => (
                <label key={listing.id} className="flex items-center gap-2 border px-2 py-1 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.listing_ids.includes(listing.id)}
                    onChange={e => {
                      if (e.target.checked) setForm(f => ({ ...f, listing_ids: [...f.listing_ids, listing.id] }));
                      else setForm(f => ({ ...f, listing_ids: f.listing_ids.filter(id => id !== listing.id) }));
                    }}
                  />
                  {listing.name}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="bg-green-700 text-white p-2 rounded" type="submit">
              {editingId ? "Update Discount" : "Create Discount"}
            </button>
            {editingId && (
              <button type="button" className="bg-gray-400 text-white p-2 rounded" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
        {message && <p className="mt-2">{message}</p>}

        {/* List of discounts */}
        <h2 className="font-bold mb-2">All Your Discounts</h2>
        <div className="flex flex-col gap-4">
          {discounts.length === 0 && <div>No discounts yet. Add one above!</div>}
          {discounts.map(discount => (
            <div key={discount.id} className="border rounded p-3 bg-gray-50 shadow flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <div className="font-semibold">{discount.title}</div>
                <div className="text-sm text-gray-600">{discount.description}</div>
                <div className="text-xs">Code: {discount.code}</div>
              </div>
              <div className="mt-2 md:mt-0 flex gap-2">
                <button className="text-blue-600 underline" onClick={() => handleEdit(discount)}>Edit</button>
                <button className="text-red-600 underline" onClick={() => handleDelete(discount.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
