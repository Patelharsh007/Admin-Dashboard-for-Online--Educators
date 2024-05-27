import React from 'react';
import Link from 'next/link';



function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-800 text-white px-4 py-6 flex justify-between">
      <p className="text-xl font-bold">
        Admin Panel
      </p>
      <ul className="flex space-x-4">
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/admin/AdminPage" className="active:text-blue-500">
            Admin
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;

