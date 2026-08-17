"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { OCDSB_SCHOOLS } from "../../lib/schools";

export default function OnboardingPage() {
  const router = useRouter();

  const [currentStage, setCurrentStage] = useState(1);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [selectedPfp, setSelectedPfp] = useState("");
  const TOTAL_PFPS = 30;
  const PFPS = Array.from(
    { length: TOTAL_PFPS },
    (_, i) => `/pfps/pfp${i + 1}.png`,
  );
  const [grade, setGrade] = useState("");
  const [school, setSchool] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = useState(false);
  const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const GRADES = ["Grade 9", "Grade 10", "Grade 11", "Grade 12", "Graduated"];
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const filteredSchools = OCDSB_SCHOOLS.filter((s) =>
    s.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const gradeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSchoolDropdownOpen(false);
      }

      if (
        gradeDropdownRef.current &&
        !gradeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsGradeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isSchoolDropdownOpen && listboxRef.current && highlightedIndex >= 0) {
      const listElement = listboxRef.current;
      const highlightedItem = listElement.children[
        highlightedIndex
      ] as HTMLElement;

      if (highlightedItem) {
        highlightedItem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isSchoolDropdownOpen]);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !user.email) {
        router.push("/login");
        return;
      }

      setEmail(user.email);

      const extractedUsername = user.email.split("@")[0];
      setUsername(extractedUsername);

      setIsLoading(false);
    };

    fetchUser();
  }, [router]);

  const handleCompleteProfile = async () => {
    setIsSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Error: No active user found.");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("profiles").insert([
      {
        id: user.id,
        username: username,
        pfp_url: selectedPfp,
        grade: grade,
        school: school,
      },
    ]);

    if (error) {
      alert("Failed to save profile: " + error.message);
      setIsSubmitting(false);
    } else {
      router.push("/");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading your profile...
      </div>
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSchoolDropdownOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredSchools.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      const selectedSchool = filteredSchools[highlightedIndex];
      setSchool(selectedSchool);
      setSearchQuery(selectedSchool);
      setIsSchoolDropdownOpen(false);
    } else if (e.key === "Escape") {
      setIsSchoolDropdownOpen(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8">
        {currentStage === 1 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-center text-gray-800">
              Stage 1: Identity
            </h2>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Username
              </label>
              <input
                type="text"
                value={username}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
              />
              <span className="text-xs text-gray-500 mt-1 leading-tight">
                Your username is generated from your school email and cannot be
                changed yet.
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Choose a Profile Picture
              </label>

              <div className="flex flex-wrap gap-4 justify-left p-4 max-h-60 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50 shadow-inner">
                {PFPS.map((pfp, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedPfp(pfp)}
                    className={`relative w-20 h-20 rounded-full overflow-hidden border-4 transition-all duration-200 ${
                      selectedPfp === pfp
                        ? "border-blue-600 scale-110 shadow-lg"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next.no-img-element */}
                    <img
                      src={pfp}
                      alt={`Avatar option ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setCurrentStage(2)}
              disabled={!selectedPfp}
              className="w-full mt-2 bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Next Step
            </button>
          </div>
        )}

        {currentStage === 2 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-center text-gray-800">
              Stage 2: Academics
            </h2>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Grade
              </label>
              <div ref={gradeDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsGradeDropdownOpen(!isGradeDropdownOpen)}
                  className="w-full px-4 py-2 text-left border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 flex justify-between items-center"
                >
                  <span className={grade ? "text-gray-900" : "text-gray-400"}>
                    {grade || "Select your grade..."}
                  </span>
                  <span className="text-gray-500 text-xs text-opacity-70">
                    ▼
                  </span>
                </button>

                {isGradeDropdownOpen && (
                  <ul className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg">
                    {GRADES.map((g) => (
                      <li
                        key={g}
                        onClick={() => {
                          setGrade(g);
                          setIsGradeDropdownOpen(false);
                        }}
                        className={`px-4 py-2 cursor-pointer text-sm ${
                          grade === g
                            ? "bg-blue-50 text-blue-900 font-semibold"
                            : "hover:bg-blue-50 text-gray-700"
                        }`}
                      >
                        {g}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                School
              </label>
              <div ref={dropdownRef} className="relative">
                <input
                  type="text"
                  placeholder="Search for your school..."
                  value={searchQuery}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSchoolDropdownOpen(true);
                    setSchool("");
                    setHighlightedIndex(-1);
                  }}
                  onFocus={() => setIsSchoolDropdownOpen(true)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />

                {isSchoolDropdownOpen && (
                  <ul
                    ref={listboxRef}
                    className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg"
                  >
                    {filteredSchools.length > 0 ? (
                      filteredSchools.map((s, index) => (
                        <li
                          key={s}
                          onClick={() => {
                            setSchool(s);
                            setSearchQuery(s);
                            setIsSchoolDropdownOpen(false);
                          }}
                          className={`px-4 py-2 cursor-pointer text-sm ${
                            highlightedIndex === index
                              ? "bg-blue-100 text-blue-900 font-medium"
                              : "hover:bg-blue-50 text-gray-700"
                          }`}
                        >
                          {s}
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-sm text-gray-500">
                        No schools found
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex gap-4 mt-2">
              <button
                type="button"
                onClick={() => setCurrentStage(1)}
                className="w-1/3 bg-gray-200 text-gray-700 font-bold py-2 rounded-md hover:bg-gray-300 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStage(3)}
                disabled={!grade || !school}
                className="w-2/3 bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {currentStage === 3 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-center text-gray-800">
              Stage 3: Review your Profile
            </h2>

            <div className="bg-blue-50 border-blue-100 rounded-lg p-6 flex flex-col gap-4">
              <div className="flex justify-center mb-2">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                  {/* eslint-disable-nect-line @next/next/no-img-element */}
                  <img
                    src={selectedPfp}
                    alt="Selected Profile Picture"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-y-3 text-sm">
                <div className="col-span-1 font-semibold text-gray-600">
                  Username:
                </div>
                <div className="col-span-2 text-gray-900 font-medium">
                  {username}
                </div>

                <div className="col-span-1 font-semibold text-gray-600">
                  Email:
                </div>
                <div className="col-span-2 text-gray-900 font-medium">
                  {email}
                </div>

                <div className="col-span-1 font-semibold text-gray-600">
                  Grade:
                </div>
                <div className="col-span-2 text-gray-900 font-medium">
                  {grade}
                </div>

                <div className="col-span-1 font-semibold text-gray-600">
                  School:
                </div>
                <div className="col-span-2 text-gray-900 font-medium">
                  {school}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-2">
              <button
                type="button"
                onClick={() => setCurrentStage(2)}
                disabled={isSubmitting}
                className="w-1/3 bg-gray-200 text-gray-700 font-bold py-2 rounded-md hover:bg-gray-300 transition disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCompleteProfile}
                disabled={isSubmitting}
                className="w-2/3 bg-green-600 text-white font-bold py-2 rounded-md hover:bg-green-700 transition disabled:bg-gray-400 flex justify-center items-center"
              >
                {isSubmitting
                  ? "Saving your profile..."
                  : "Confirm & Create Profile"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
