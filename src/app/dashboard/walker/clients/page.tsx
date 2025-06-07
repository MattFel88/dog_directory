"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../../lib/supabaseClient";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export default function WalkerClientsPage() {
  const [clients, setClients] = useState<Customer[]>([]);
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      const { data } = await supabase.from("customers").select("*");
      if (data) setClients(data);
    };
    fetchClients();
  }, []);

  // Handle form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewClient({ ...newClient, [e.target.name]: e.target.value });
  };

  // Add a new client
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error, data } = await supabase.from("customers").insert([newClient]);
    if (!error && data) setClients((prev) => [...prev, ...data]);
    setLoading(false);
    setNewClient({ name: "", email: "", phone: "" });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">My Customers</h2>
      <ul className="mb-6">
        {clients.map((c) => (
          <li key={c.id} className="border-b py-2">
            <span className="font-semibold">{c.name}</span>
            <span className="ml-4 text-sm text-gray-600">{c.email}</span>
            <span className="ml-4 text-sm text-gray-600">{c.phone}</span>
          </li>
        ))}
      </ul>
      <form className="space-y-2" onSubmit={handleSubmit}>
        <h3 className="font-semibold">Add a new customer</h3>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={newClient.name}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-full"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={newClient.email}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-full"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          value={newClient.phone}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-full"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded font-semibold"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Customer"}
        </button>
      </form>
    </div>
  );
}
