'use client';

import { useState, useEffect } from "react";
import { supabase } from "../../../../../lib/supabaseClient";
import Image from 'next/image';

type Dog = {
  id: string;
  owner_id: string;
  name: string;
  breed: string;
  age: number;
  photo_url: string | null;
  created_at: string;
};

export default function CustomerDogsPage() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Dog>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch current user and their dogs
  useEffect(() => {
    const fetchDogs = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }
      setUserId(session.user.id);
      const { data } = await supabase
        .from("dogs")
        .select("*")
        .eq("owner_id", session.user.id)
        .order("created_at", { ascending: false });
      if (data) setDogs(data);
      setLoading(false);
    };

    fetchDogs();
  }, []);

  // Handle form field changes
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "age" ? Number(value) : value,
    }));
  }

  // Open add/edit dog form
  function openForm(dog?: Dog) {
    if (dog) {
      setFormData(dog);
      setEditId(dog.id);
    } else {
      setFormData({});
      setEditId(null);
    }
    setShowForm(true);
  }

  // Handle form submit (add or edit dog)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !userId) return;
    setLoading(true);

    const dogObj = {
      ...formData,
      owner_id: userId,
    };

    let result;
    if (editId) {
      // Edit
      result = await supabase
        .from("dogs")
        .update(dogObj)
        .eq("id", editId)
        .select();
    } else {
      // Add
      result = await supabase
        .from("dogs")
        .insert([dogObj])
        .select();
    }

    if (result.error) {
      alert("Error: " + result.error.message);
    } else {
      // Refresh list
      const { data } = await supabase
        .from("dogs")
        .select("*")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });
      setDogs(data || []);
      setShowForm(false);
    }
    setLoading(false);
  }

  // Handle delete dog
  async function handleDelete(id: string) {
    if (!window.confirm("Delete this dog?")) return;
    setLoading(true);
    await supabase.from("dogs").delete().eq("id", id);
    setDogs(dogs.filter(dog => dog.id !== id));
    setLoading(false);
  }

  // A fallback image for empty/missing URLs
  const fallbackImg = "/default-dog.jpg"; // Put a generic dog image in your /public folder

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Dogs</h1>
      {loading && <p>Loading...</p>}

      {!loading && (
        <>
          <button
            className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={() => openForm()}
          >
            Add Dog
          </button>
          <ul className="space-y-4">
            {dogs.map((dog) => (
              <li key={dog.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {(dog.photo_url || fallbackImg) && (
                    <Image
                      src={dog.photo_url || fallbackImg}
                      alt={dog.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover border"
                    />
                  )}
                  <div>
                    <div className="font-semibold">{dog.name}</div>
                    <div className="text-gray-600 text-sm">{dog.breed} &middot; Age: {dog.age ?? "N/A"}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                    onClick={() => openForm(dog)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                    onClick={() => handleDelete(dog.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <form
                className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md"
                onSubmit={handleSubmit}
              >
                <h2 className="text-lg font-bold mb-4">{editId ? "Edit Dog" : "Add Dog"}</h2>
                <input
                  type="text"
                  name="name"
                  placeholder="Dog's Name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  required
                  className="w-full mb-2 border px-3 py-2 rounded"
                />
                <input
                  type="text"
                  name="breed"
                  placeholder="Breed"
                  value={formData.breed || ""}
                  onChange={handleChange}
                  className="w-full mb-2 border px-3 py-2 rounded"
                />
                <input
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={formData.age || ""}
                  onChange={handleChange}
                  min={0}
                  className="w-full mb-2 border px-3 py-2 rounded"
                />
                <input
                  type="text"
                  name="photo_url"
                  placeholder="Photo URL"
                  value={formData.photo_url || ""}
                  onChange={handleChange}
                  className="w-full mb-4 border px-3 py-2 rounded"
                />

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
