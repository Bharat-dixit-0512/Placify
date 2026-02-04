const NotFound = () => {
  return (
    <div className="py-16">
      <div className="mx-auto w-full max-w-3xl px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900">Page not found</h2>
          <p className="mt-2 text-slate-600">The page you're looking for doesn't exist.</p>
        </div>
      </div>
    </div>
  )
}

export default NotFound
