import { TrainTable } from '@/components/trains/TrainTable';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        <TrainTable />
      </div>
    </main>
  );
}
