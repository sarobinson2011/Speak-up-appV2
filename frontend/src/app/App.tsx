import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Speak Up V2
            </h1>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto py-6 px-4">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

function Home() {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-semibold text-gray-700">
        Anonymous Petition Platform
      </h2>
      <p className="mt-4 text-gray-600">
        Zero-knowledge proof enabled petitions coming soon...
      </p>
    </div>
  )
}

export default App
