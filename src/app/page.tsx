export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Freelancian MVP v0.1
          </h1>
          <p className="text-lg text-neutral-600 mb-8">
            Beautiful financial tracking for Thai freelancers
          </p>
          <div className="card p-8 max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">Project Foundation Ready</h2>
            <p className="text-neutral-600">
              Next.js 14 with TypeScript, Tailwind CSS, and all essential dependencies are configured.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}