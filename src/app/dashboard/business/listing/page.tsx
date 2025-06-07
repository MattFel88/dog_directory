'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../../../lib/authContext';
import { supabase } from '../../../../../lib/supabaseClient';
import Navbar from '../../../../components/Navbar';

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

const emptyForm = {
  name: "",
  category: "",
  description: "",
  phone: "",
  email: "",
  website: "",
  area: "",
};

export default function BusinessListingsManager() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Business[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [message, setMessage] = useState("");

  // Load all listings for this business user
  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data } = await supabase.from('businesses').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data) setListings(data);
    }
    load();
  }, [user]);

  // Reset form when done editing/creating
  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleEdit(listing: Business) {
    setEditingId(listing.id);
    setForm({
      name: listing.name,
      category: listing.category,
      description: listing.description,
      phone: listing.phone || "",
      email: listing.email || "",
      website: listing.website || "",
      area: listing.area,
    });
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    const { error } = await supabase.from('businesses').delete().eq('id', id);
    if (error) setMessage(error.message);
    else {
      setListings(listings.filter(l => l.id !== id));
      if (editingId === id) resetForm();
      setMessage("Listing deleted.");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setMessage("Saving...");
    if (editingId) {
      // Update
      const { error } = await supabase.from('businesses').update({ ...form, updated_at: new Date() }).eq('id', editingId);
      if (error) setMessage(error.message);
      else {
        setListings(listings.map(l => l.id === editingId ? { ...l, ...form } : l));
        setMessage("Listing updated!");
        resetForm();
      }
    } else {
      // Create
      const { error, data } = await supabase.from('businesses').insert([{ ...form, user_id: user.id }]).select().single();
      if (error) setMessage(error.message);
      else {
        setListings([data, ...listings]);
        setMessage("Listing created!");
        resetForm();
      }
    }
  }

  return (
    <>
      <Navbar />
      <main className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Your Business Listings</h1>

        {/* Form for create or edit */}
        <form onSubmit={handleSave} className="flex flex-col gap-4 border rounded p-4 mb-6 bg-white shadow">
          <h2 className="font-bold">{editingId ? "Edit Listing" : "Add New Listing"}</h2>
          <input className="border p-2 rounded" placeholder="Business Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <input className="border p-2 rounded" placeholder="Category (Dog Walker, Groomer...)" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required />
          <textarea className="border p-2 rounded" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
          <input className="border p-2 rounded" placeholder="Service Area (e.g. Derbyshire)" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} required />
          <input className="border p-2 rounded" placeholder="Website URL (optional)" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
          <input className="border p-2 rounded" placeholder="Email (optional)" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <input className="border p-2 rounded" placeholder="Phone (optional)" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <div className="flex gap-2">
            <button className="bg-green-700 text-white p-2 rounded" type="submit">
              {editingId ? "Update Listing" : "Create Listing"}
            </button>
            {editingId && (
              <button type="button" className="bg-gray-400 text-white p-2 rounded" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
        {message && <p className="mt-2">{message}</p>}

        {/* List of all listings */}
        <h2 className="font-bold mb-2">All Your Listings</h2>
        <div className="flex flex-col gap-4">
          {listings.length === 0 && <div>No listings yet. Add one above!</div>}
          {listings.map(listing => (
            <div key={listing.id} className="border rounded p-3 bg-gray-50 shadow flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <div className="font-semibold">{listing.name}</div>
                <div className="text-sm text-gray-600">{listing.category} · {listing.area}</div>
                <div className="text-xs">{listing.description.substring(0, 60)}...</div>
              </div>
              <div className="mt-2 md:mt-0 flex gap-2">
                <button className="text-blue-600 underline" onClick={() => handleEdit(listing)}>Edit</button>
                <button className="text-red-600 underline" onClick={() => handleDelete(listing.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
