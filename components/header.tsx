import Link from "next/link";

export function Header() {
  return (
    <header className="bg-navy text-ivory">
      <div className="mx-auto flex max-w-5xl items-center px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          피프티바이브<span className="brand-cursor" aria-hidden="true">▮</span>
        </Link>
      </div>
    </header>
  );
}
