"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function EditWalkerProfile() {
  const [profile, setProfile] = useState({
    name: "",
    photo_url: "",
    about: "",
    insurance: "",
    qualifications: "",
    service_areas: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Load current profile if it exists
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data } = await supabase.from("walker_profiles").select("*").single();
      if (data) setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Handle photo upload
  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // You might want to change this logic based on your storage setup
    const { data, error } = await supabase.storage
      .from("walker-photos") // make sure this storage bucket exists!
      .upload(`public/${file.name}`, file, {
        cacheControl: "3600",
        upsert: true,
      });
    if (!error && data) {
      const url = supabase.storage.from("walker-photos").getPublicUrl(data.path).data.publicUrl;
      setProfile((p) => ({ ...p, photo_url: url }));
    }
  };

  // Save profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Upsert ensures you create OR update the profile
    const { error } = await supabase.from("walker_profiles").upsert(profile, { onConflict: "id" });
    setLoading(false);
    if (!error) {
      router.push("/dashboard/walker");
    } else {
      alert("Error saving profile.");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Edit Walker Profile</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block font-semibold">Name:</label>
          <input
            name="name"
            type="text"
            value={profile.name}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block font-semibold">Profile Photo:</label>
          <input type="file" accept="image/*" onChange={handlePhoto} />
          {profile.photo_url && (
            <div className="mt-2">
              <Image
                src={profile.photo_url}
                alt="Walker"
                width={64}
                height={64}
                className="rounded-full object-cover"
                unoptimized
              />
            </div>
          )}
        </div>
        <div>
          <label className="block font-semibold">About:</label>
          <textarea
            name="about"
            value={profile.about}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
            rows={3}
          />
        </div>
        <div>
          <label className="block font-semibold">Insurance:</label>
          <input
            name="insurance"
            type="text"
            value={profile.insurance}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
          />
        </div>
        <div>
          <label className="block font-semibold">Qualifications:</label>
          <input
            name="qualifications"
            type="text"
            value={profile.qualifications}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
          />
        </div>
        <div>
          <label className="block font-semibold">Service Areas:</label>
          <input
            name="service_areas"
            type="text"
            value={profile.service_areas}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
