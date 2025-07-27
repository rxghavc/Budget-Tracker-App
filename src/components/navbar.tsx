import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full px-4 py-3 flex items-center justify-between bg-background border-b border-border">
      <Link href="/">
        <div className="flex items-center gap-2">
          <Image src="/next.svg" alt="Logo" width={32} height={32} />
          <span className="font-bold text-lg hidden sm:inline">Budget Tracker</span>
        </div>
      </Link>
      <div className="flex gap-2 items-center">
        {/* Add nav links or actions here if needed */}
      </div>
    </nav>
  );
}
