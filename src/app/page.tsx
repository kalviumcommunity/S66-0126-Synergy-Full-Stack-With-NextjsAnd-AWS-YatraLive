import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Real-Time Train Tracker
      </h1>
      <p className="text-center text-gray-600">
        Loading train data...
      </p>
    </main>
  )
}