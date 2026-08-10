import Link from "next/link";

export default function Navbar() {
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

          <Link
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
