import Link from "next/link";

export default function Home() {
  return (
    <main className="h-100">
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-6xl font-bold">Welcome to Next.js!</h1>
        <p className="mt-3 text-2xl">Get started by editing the page at <code>src/app/page.js</code></p>
        <p className="text-2xl font-bold"><Link href="/admin/AdminPage">Admin Panel</Link></p>
      </div>
    </main>
  );
}
