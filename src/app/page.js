import Link from "next/link";

export default function Home() {
  return (
    <main className="h-100">
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-2xl font-bold"><Link href="/admin/AdminPage">Admin Panel</Link></p>
      </div>
    </main>
  );
}
