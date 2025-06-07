"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

type WalkerProfile = {
  id: string;
  name: string;
  photo_url: string;
  about: string;
  insurance: string;
  qualifications: string;
  service_areas: string;
};

export default function WalkerDashboard() {
  const [profile, setProfile] = useState<WalkerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      // Replace "walker_profiles" with your actual table name
      const { data } = await supabase
        .from("walker_profiles")
        .select("*")
        .single();

      if (data) setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="p-4">Loading…</div>;

  if (!profile)
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">Walker Profile</h2>
        <p>
          No profile found.{" "}
          <button
            className="text-blue-600 underline"
            onClick={() => router.push("/dashboard/walker/edit")}
          >
            Create Profile
          </button>
        </p>
      </div>
    );

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Walker Dashboard</h2>
      <div className="flex gap-4 items-center mb-4">
        {profile.photo_url ? (
          <Image
            src={profile.photo_url}
            alt="Walker"
            width={80}
            height={80}
            className="w-20 h-20 rounded-full object-cover"
            unoptimized // Remove if you want to use Next/Image optimization (ensure URLs are valid!)
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No Photo</span>
          </div>
        )}
        <div>
          <div className="text-lg font-semibold">{profile.name}</div>
          <div className="text-gray-600">{profile.about}</div>
        </div>
        <button
          className="ml-auto bg-blue-600 text-white px-3 py-1 rounded"
          onClick={() => router.push("/dashboard/walker/edit")}
        >
          Edit Profile
        </button>
      </div>
      <div className="mb-2">
        <b>Insurance:</b> {profile.insurance}
      </div>
      <div className="mb-2">
        <b>Qualifications:</b> {profile.qualifications}
      </div>
      <div className="mb-2">
        <b>Service Areas:</b> {profile.service_areas}
      </div>
      <hr className="my-6" />
      <h3 className="text-xl font-semibold mb-2">Clients & Dogs</h3>
      <p>(You’ll be able to manage these in the next step!)</p>
    </div>
  );
}

