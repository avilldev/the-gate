"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsLoggedIn(!!session);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="bg-white shadow-md w-full p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          The Gate
        </Link>

        <div className="flex gap-6 text-gray-600 font-medium items-center">
          <Link href="/resources" className="hover:text-blue-600 transition">
            Find Resources
          </Link>

          <Link href="/upload" className="hover:text-blue-600 transition">
            Upload
          </Link>

          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-200 text-white rounded-md hover:bg-blue-300 transition"
            >
              Login
            </Link>
          )}

          {isLoggedIn ? (
            <Link href="/"></Link>
          ) : (
            <Link
              href="/signup"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Signup
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
