import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--bg)] px-4">
      <h1 className="font-serif text-3xl text-[var(--ink)]">Page not found</h1>
      <Link href="/dashboard" className="btn btn-primary">
        Back to dashboard
      </Link>
    </div>
  );
}
