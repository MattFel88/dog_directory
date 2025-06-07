// /src/app/layout.tsx
import './output.css'  // <-- THIS IS THE BUILT CSS FILE

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
