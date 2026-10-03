"use client";
import { useState, useEffect, use } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { error } from "console";

export default function EditUploadPage() {
  const router = useRouter();
  const params = useParams();
  const uploadId = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [stream, setStream] = useState("");
  const [language, setLanguage] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [teacher, setTeacher] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [classNumber, setClassNumber] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchUploadDetails = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: uploadData, error } = await supabase
        .from("uploads")
        .select("*")
        .eq("id", uploadId)
        .single();

      if (error || !uploadData) {
        alert("Could not load upload details.");
        router.push("/dashboard");
        return;
      }

      if (uploadData.uploader_id !== user.id) {
        alert("You do not have permission to edit this upload.");
        router.push("/dashboard");
        return;
      }

      setTitle(uploadData.title);
      setSubject(uploadData.subject);
      setGrade(uploadData.grade);
      setStream(uploadData.stream);
      setLanguage(uploadData.language);
      setCourseCode(uploadData.course_code);
      setTeacher(uploadData.teacher);
      setAcademicYear(uploadData.academic_year);
      setClassNumber(uploadData.class_number || "");
      setNotes(uploadData.notes || "");

      setIsLoading(false);
    };

    fetchUploadDetails();
  }, [uploadId, router]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("uploads")
      .update({
        title,
        subject,
        course_code: courseCode,
        notes,
      })
      .eq("id", uploadId);

    if (error) {
      setErrorMessage("Failed to save changes: " + error.message);
      setIsSaving(false);
    } else {
      setHasChanges(false);
      router.push("/dashboard");
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        Loading upload data...
      </div>
    );
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("uploads")
      .delete()
      .eq("id", uploadId);

    if (error) {
      setErrorMessage("Failed to delete upload: " + error.message);
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    } else {
      setHasChanges(false);
      router.push("/dashboard");
    }
  };

  const handleNavigation = (path: string) => {
    if (hasChanges) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave and lose progress?",
      );
      if (!confirmLeave) return;
    }
    router.push(path);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4 py-12">
      <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-md">
        <div className="mb-8 flex justify-between items-end border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Edit Upload</h1>
            <p className="text-gray-500 mt-1">
              Update your resource details below.
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="text-sm px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md font-medium transition"
            >
              Delete Upload
            </button>
            <button className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md font-medium transition">
              Preview Public Page
            </button>
            <button
              type="button"
              onClick={() => handleNavigation("/dashboard")}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setHasChanges(true);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setHasChanges(true);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Grade</label>

              <select
                required
                value={grade}
                onChange={(e) => {
                  setGrade(e.target.value);
                  setHasChanges(true);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="" disabled>
                  Select Grade...
                </option>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Stream
              </label>

              <select
                required
                value={stream}
                onChange={(e) => {
                  setStream(e.target.value);
                  setHasChanges(true);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="" disabled>
                  Select Stream...
                </option>
                <option value="De-Streamed">De-Streamed</option>
                <option value="Academic">Academic</option>
                <option value="Applied">Applied</option>
                <option value="University">University</option>
                <option value="College">College</option>
                <option value="Mixed">Mixed</option>
                <option value="Open">Open</option>
                <option value="Workplace">Workplace</option>
                <option value="Workplace">I am not sure...</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Language
              </label>
              <input
                type="text"
                required
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  setHasChanges(true);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Course Code
              </label>
              <input
                type="text"
                required
                value={courseCode}
                onChange={(e) => {
                  setCourseCode(e.target.value);
                  setHasChanges(true);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Teacher
              </label>
              <input
                type="text"
                required
                value={teacher}
                onChange={(e) => {
                  setTeacher(e.target.value);
                  setHasChanges(true);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Academic Year
              </label>

              <select
                required
                value={academicYear}
                onChange={(e) => {
                  setAcademicYear(e.target.value);
                  setHasChanges(true);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="" disabled>
                  Select Academic Year...
                </option>
                <option value="2026-2027">2026-2027</option>
                <option value="2025-2026">2025-2026</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2023-2024">2023-2024</option>
                <option value="2022-2023">2022-2023</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              required
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setHasChanges(true);
              }}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
            />
          </div>

          {errorMessage && (
            <div className="text-red-600 text-sm font-semibold text-center bg-red-50 py-2 rounded-md border border-red-200">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition shadow-sm text-lg mt-4 disabled:bg-blue-400"
          >
            {/* {isSaving ? "Saving..." : "Save Changes"} */}
            Save Changes
          </button>
        </form>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4 text-center">
            <h3 className="text-xl font-bold text-gray-900">Delete Upload?</h3>
            <p className="text-gray-600">
              Are you sure you want to permanently delete this resource? This
              action cannot be undone.
            </p>
            <div className="flex justify-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-6 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition disabled:bg-red-400"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
