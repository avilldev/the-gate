"use client";
import { useState, useEffect, use } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function PublicResourcePage() {
  const router = useRouter();
  const params = useParams();
  const resourceId = params.id;

  const [resource, setResource] = useState<any>(null);

  const [uploader, setUploader] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResourceData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: uploadData, error: uploadError } = await supabase
        .from("uploads")
        .select("*")
        .eq("id", resourceId)
        .single();

      if (uploadError || !uploadData) {
        alert("Resource not found.");
        router.push("/dashboard");
        return;
      }
      setResource(uploadData);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, username, school, grade, pfp_url")
        .eq("id", uploadData.uploader_id)
        .single();

      if (profileData) {
        setUploader(profileData);
      }

      setIsLoading(false);
    };

    fetchResourceData();
  }, [resourceId, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        Loading resource...
      </div>
    );
  }

  if (!resource) return null;

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50 p-4 py-12">
      <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-md flex flex-col gap-8">
        <div className="flex justify-between items-start border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {resource.title}
            </h1>
            <div className="flex flex-wrap gap-3 mt-3 text-sm font-medium">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {resource.course_code}
              </span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                {resource.subject}
              </span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                Uploaded{" "}
                {new Date(resource.created_at).toLocaleTimeString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="text-sm px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md font-medium transition shrink-0"
          >
            Go Back
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-3">
                Resource Details
              </h3>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <span className="block text-gray-500 font-medium">
                    Academic Year
                  </span>
                  <span className="text-gray-900">
                    {resource.academic_year || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500 font-medium">
                    Grade & Stream
                  </span>
                  <span className="text-gray-900">
                    {resource.grade} - {resource.stream}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500 font-medium">
                    Teacher
                  </span>
                  <span className="text-gray-900">
                    {resource.teacher || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500 font-medium">
                    School
                  </span>
                  <span className="text-gray-900">
                    {uploader.school || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500 font-medium">
                    Language
                  </span>
                  <span className="text-gray-900">
                    {resource.language || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500 font-medium">
                    Class Number
                  </span>
                  <span className="text-gray-900">
                    {resource.class_number || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-3">
                Description & Notes
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                {resource.notes}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
              Uploaded By
            </h3>
            {uploader ? (
              <Link
                href={`/user/${uploader.id}`}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center gap-4 hover:border-blue-300 hover:shadow-md transition cursor-pointer group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={uploader.pfp_url}
                  alt={uploader.username}
                  className="w-14 h-14 rounded-full border-2 border-white shadow-sm object-cover group-hover:scale-105 transition-transform"
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {uploader.username}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {uploader.grade}
                  </span>
                  <span
                    className="text-xs text-gray-500 truncate"
                    title="{uploader.school}"
                  >
                    {uploader.school}
                  </span>
                </div>
              </Link>
            ) : (
              <div className="text-sm text-gray-500 italic">
                User information unavailable.
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">
            Attached Documents
          </h3>
          <div className="flex flex-col gap-3">
            {resource.file_urls && resource.file_urls.length > 0 ? (
              resource.file_urls.map((url: string, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 bg-blue-50 border border-blue-100 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <span
                      className="font-semibold text-blue-900 truncate max-w-s"
                      title="{resource.file_names?.[index]"
                    >
                      {resource.file_names && resource.file_names[index]
                        ? resource.file_names[index]
                        : `Document ${index + 1}`}
                    </span>
                  </div>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-md hober:bg-blue-700 transition shadow-sm"
                  >
                    View PDF
                  </a>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">
                No files attached to this resource.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
