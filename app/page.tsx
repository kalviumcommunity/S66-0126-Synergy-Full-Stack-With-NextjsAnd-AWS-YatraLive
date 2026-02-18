import { TrainTable } from '@/components/trains/TrainTable';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8">
        <TrainTable />
      </div>
    </main>
  );
}