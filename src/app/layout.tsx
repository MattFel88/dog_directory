// /src/app/layout.tsx
import './output.css'  // <-- THIS IS THE BUILT CSS FILE

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f6f3ee] min-h-screen text-[#222]">{children}</body>
    </html>
  );
}
