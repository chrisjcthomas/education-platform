import { PyodideDemo } from '@/components/demo/pyodide-demo'
import { EducationalContentDemo } from '@/components/demo/educational-content-demo'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 space-y-8">
        <EducationalContentDemo />
        <PyodideDemo />
      </div>
    </main>
  )
}