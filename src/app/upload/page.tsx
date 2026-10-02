"use client";
import { useState, useEffect, use } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UploadPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [files, setFiles] = useState<File[]>([]);
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

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const enforceAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setIsCheckingAuth(false);
      }
    };
    enforceAuth();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      const validPdfs = selectedFiles.filter(
        (file) => file.type === "application/pdf",
      );

      if (validPdfs.length !== selectedFiles.length) {
        alert("Some files were removed. Please only upload PDF documents.");
      }

      setFiles((prev) => [...prev, ...validPdfs]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files.length === 0) {
      alert("Please select at least one PDF file to upload.");
      return;
    }

    setIsUploading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user)
        throw new Error("Authentication error. Please log in again.");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("school")
        .eq("id", user.id)
        .single();

      if (profileError || !profile)
        throw new Error("Could not retrieve your school information.");

      const uploadedFileUrls: string[] = [];

      for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${safeFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("resources")
          .upload(filePath, file);

        if (uploadError)
          throw new Error(
            `Failed to upload ${file.name}: ${uploadError.message}`,
          );

        const {
          data: { publicUrl },
        } = supabase.storage.from("resources").getPublicUrl(filePath);

        uploadedFileUrls.push(publicUrl);
      }

      const { error: dbError } = await supabase.from("uploads").insert({
        uploader_id: user.id,
        school: profile.school,
        title,
        subject,
        grade,
        stream,
        language,
        course_code: courseCode,
        teacher,
        academic_year: academicYear,
        class_number: classNumber || null,
        notes: notes || null,
        file_urls: uploadedFileUrls,
      });

      if (dbError) throw new Error(`Database error:${dbError.message}`);

      alert("Success! Your resrouces have been securely uploaded.");
      window.location.href = "/dashboard";
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        Loading...
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4 py-12">
      <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-md">
        <div className="mb-8 flex justify-between items-end border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Upload Resources
            </h1>
            <p className="text-gray-500 mt-1">
              Share your PDFs to help other students.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Cancel & Return
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex flex-col gap-3 border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 text-center relative hover:bg-gray-100 transition">
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Click to select PDFs"
            />
            <div className="text-gray-600 font-medium pointer-events-none">
              Click or drag here to upload PDF documents
            </div>
            <div className="text-sm text-gray-400 pointer-events-none">
              Unlimited files allowed - PDF format only
            </div>
          </div>

          {files.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-gray-700">
                Selected Files:
              </span>
              <ul className="bg-gray-50 rounded-md border border-gray-200 divide-y divide-gray-200 max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 flex justify-between items-center text-sm"
                  >
                    <span className="truncate text-gray-800 font-medium">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 ml-4 font-bold"
                    >
                      X
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-gray-800 text-lg border-b pb-2">
              Resource Details (Required)
            </h3>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Grade 9 Science Physics Unit Test"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={notes}
                required
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  "For example:\n- What you had to do for the assignment\n- What the notes contain\n- What the evaluation was on\netc."
                }
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
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
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Grade
                </label>
                <select
                  required
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
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
                  onChange={(e) => setStream(e.target.value)}
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
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="English, French Immersion..."
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
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Teacher
                </label>
                <input
                  type="text"
                  placeholder="Mr./Ms. Full Name"
                  required
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
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
                  onChange={(e) => setAcademicYear(e.target.value)}
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
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-gray-800 text-lg border-b pb-2">
              Additional Information (Optional)
            </h3>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Class Number
              </label>
              <input
                type="text"
                value={classNumber}
                onChange={(e) => setClassNumber(e.target.value)}
                placeholder="e.g. 02"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full bg-blue-600 text-white fount-bold py-3 rounded-md hover:bg-blue-700 transition shadow-sm text-lg"
          >
            {isUploading
              ? "Uploading files, please wait..."
              : "Submit for Upload"}
          </button>
        </form>
      </div>
    </main>
  );
}
