"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    const checkExistingSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      }
    };

    checkExistingSession();
  }, [router]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setErrorMessage("");
      router.push("/onboarding");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Join The Gate
        </h2>

        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">
              School Email
              <span className="block text-xs font-normal text-gray-500">
                The email must be an OCDSB student email.
              </span>
            </label>

            <input
              type="email"
              name="email"
              placeholder="School Email Address"
              pattern=".+@ocdsb\.ca$"
              title="Must be an OCDSB student email address, ending in @ocdsb.ca"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">
              Password
              <span className="block text-xs text-gray-500 leading-tight mt-1 mb-1">
                Disclaimer: There are no password constraints. The developers
                are not responsible for compromised accounts.
              </span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create Password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 pr-16"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-blue-600 font-medium transition"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Type Password Again"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 pr-16"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-blue-600 font-medium transition"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="text-red-600 text-sm font-semibold text-center bg-red50 py-2 rounded-md border border-red-200">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700 transition"
          >
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
