import supabase from '@sngnews/shared-supabase'

export default async function Home() {
  const { data: categoriesData, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  const { data: newsData, error: newsError } = await supabase
    .from('news')
    .select('*, categories(name, slug)')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(20)

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">SNG News</h1>
          <p className="text-gray-600">Sree Narayana Guru Research Center</p>
        </header>

        {/* Categories Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Categories</h2>
          <div className="flex flex-wrap gap-3">
            {categoriesError ? (
              <p className="text-red-500">Error loading categories</p>
            ) : categoriesData && categoriesData.length > 0 ? (
              categoriesData.map((category) => (
                <a
                  key={category.id}
                  href={`#${category.slug}`}
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                >
                  {category.name}
                </a>
              ))
            ) : (
              <p className="text-gray-500">No categories available</p>
            )}
          </div>
        </section>

        {/* News Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Latest News</h2>
          <div className="grid gap-6">
            {newsError ? (
              <p className="text-red-500">Error loading news: {newsError.message}</p>
            ) : newsData && newsData.length > 0 ? (
              newsData.map((item) => (
                <article key={item.id} className="p-6 border rounded-lg bg-white shadow hover:shadow-lg transition-shadow">
                  {item.categories && (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mb-3">
                      {item.categories.name}
                    </span>
                  )}
                  <h3 className="text-2xl font-semibold mb-2">{item.title}</h3>
                  {item.description && (
                    <p className="text-gray-600 mb-4">{item.description}</p>
                  )}
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full max-w-2xl h-auto rounded-lg mb-4"
                    />
                  )}
                  {item.content && (
                    <div className="prose max-w-none mb-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{item.content}</p>
                    </div>
                  )}
                  {item.youtube_link && (
                    <a
                      href={item.youtube_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      Watch on YouTube
                    </a>
                  )}
                  {item.published_at && (
                    <p className="text-sm text-gray-500 mt-4">
                      Published on {new Date(item.published_at).toLocaleDateString()}
                    </p>
                  )}
                </article>
              ))
            ) : (
              <p className="text-gray-500">No news items found</p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
