"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const TOTAL_PFPS = 30;
  const PFPS = Array.from(
    { length: TOTAL_PFPS },
    (_, i) => `/pfps/pfp${i + 1}.png`,
  );

  useEffect(() => {
    const fetchProfileData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
      } else {
        setProfile(data);
      }

      setIsLoading(false);
    };

    fetchProfileData();
  }, [router]);

  const handlePfpChange = async (newPfpUrl: string) => {
    setIsUpdating(true);

    const { error } = await supabase
      .from("profiles")
      .update({ pfp_url: newPfpUrl })
      .eq("id", profile.id);

    if (error) {
      alert("Failed to update profile picture: " + error.message);
    } else {
      setProfile((prev: any) => ({ ...prev, pfp_url: newPfpUrl }));
      setIsPopUpOpen(false);
    }

    setIsUpdating(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Error logging out: " + error.message);
    } else {
      router.push("/login");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading Data
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Error: The Profile was not found.
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50 pt-7 px-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-8">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-8">
          My Profile
        </h2>

        <div className="flex flex-row items-center gap-12">
          <div
            onClick={() => setIsPopUpOpen(true)}
            className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm shrink-0 group cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.pfp_url}
              alt={`${profile.username}'s avatar`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gray-500  flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-white font-semibold tracking-wide px-4 text-center">
                Change Profile Picture
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <span className="text-gray-700 text-2xl">Welcome Back</span>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              {profile.username}
            </h3>

            <span className="text-gray-700 text-lg">{profile.grade}</span>
            <span className="text-gray-700 text-lg">{profile.school}</span>

            <span className="font-semibold text-gray-900 mt-3">
              Contribution Points: {profile.contribution_points}
            </span>
          </div>

          <div className="flex flex-col gap-4 min-w-40">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-md font-medium hover:bg-red-100 transition"
            >
              Log Out
            </button>
            <button
              onClick={() => router.push("/change-password")}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300 transition"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {isPopUpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">
                Choose a new Profile Picture
              </h3>
              <button
                onClick={() => setIsPopUpOpen(false)}
                disabled={isUpdating}
                className="text-gray-400 hover:text-gray-800 font-bold text-2xl transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-60 shadow-inner">
              <div className="flex flex-wrap gap-4 justify-center">
                {PFPS.map((pfp, index) => (
                  <button
                    key={index}
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handlePfpChange(pfp)}
                    className={`relative w-20 h-20 rounded-full overflow-hidden border-4 transition-all duration-200 ${
                      profile.pfp_url === pfp
                        ? "border-blue-600 scale-110 shadow-lg"
                        : "border-transparent hover:border-gray-300 hover:scale-105"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pfp}
                      alt={`Avatar option ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {isUpdating && (
              <div className="p-3 bg-blue-50 text-blue-800 text-center font-medium border-t border-blue-100 animate-pulse">
                Saving your new Profile Picture...
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
