"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Inline SVG logo from layout.tsx metadata */}
      <span className="mb-4 drop-shadow" aria-label="Budgetly Logo">
        <svg fill="#0ea5e9" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" width="64" height="64">
          <path d="M200,120a16,16,0,1,1-16-16A16,16,0,0,1,200,120ZM156,64H116a12,12,0,0,0,0,24h40a12,12,0,0,0,0-24Zm100,48v32a28,28,0,0,1-27.54,28L213.2,214.73A20,20,0,0,1,194.36,228H181.64a20,20,0,0,1-18.84-13.27l-1-2.73H110.17l-1,2.73A20,20,0,0,1,90.36,228H77.64A20,20,0,0,1,58.8,214.73L46.5,180.28A91.63,91.63,0,0,1,25.75,137.8,11.91,11.91,0,0,0,24,144a12,12,0,0,1-24,0,36.07,36.07,0,0,1,24.56-34.13A92.13,92.13,0,0,1,116,28H220a12,12,0,0,1,0,24H210a92,92,0,0,1,22.48,31.45l.42,1A28.05,28.05,0,0,1,256,112Zm-24,0a4,4,0,0,0-4-4h-3.66a12,12,0,0,1-11.45-8.41A68,68,0,0,0,148,52H116A68,68,0,0,0,65.86,165.94,11.85,11.85,0,0,1,68.31,170l12.15,34h7.08l2.87-8a12,12,0,0,1,11.3-8h68.58a12,12,0,0,1,11.3,8l2.87,8h7.08l17.16-48a12,12,0,0,1,11.3-8h8a4,4,0,0,0,4-4Z"/>
        </svg>
      </span>
      <h1 className="text-5xl font-bold mb-4 text-primary">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-muted-foreground mb-6">Sorry, the page you are looking for does not exist or has been moved.</p>
      <Link href="/" className="inline-block px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 transition">Go to Dashboard</Link>
    </div>
  );
}
