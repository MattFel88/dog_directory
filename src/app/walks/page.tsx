// Example: /app/walks/page.tsx
import Navbar from '../../components/Navbar';

export default function DirectoryPage() {
  return (
    <>
      <Navbar />
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Business Directory</h1>
        <p>Directory listing goes here!</p>
      </main>
    </>
  );
}