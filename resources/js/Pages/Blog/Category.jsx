import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Calendar, Clock, ArrowRight, Loader2 } from "lucide-react";

const ArticleCard = ({ article }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Link
      to={`/blog/${article.slug}`}
      className="group block bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
    >
      {article.featured_image && (
        <div className="aspect-video overflow-hidden">
          <img
            src={article.featured_image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-cyan-600 transition-colors">
          {article.title}
        </h3>
        <p className="text-slate-600 mb-4 line-clamp-2 text-sm">
          {article.excerpt}
        </p>
        <div className="flex items-center text-sm text-slate-500 gap-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(article.published_at)}
          </span>
          {article.reading_time && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.reading_time} min
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

const CategorySidebar = ({ categories, currentCategory }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-4">Categories</h3>
      <div className="space-y-2">
        <Link
          to="/blog"
          className="block px-3 py-2 rounded-lg transition-colors text-slate-600 hover:bg-slate-50"
        >
          All Articles
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/blog/category/${category.slug}`}
            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
              currentCategory?.slug === category.slug
                ? "bg-cyan-50 text-cyan-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>{category.name}</span>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
              {category.articles_count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default function BlogCategory() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    category: null,
    articles: { data: [] },
    categories: [],
  });

  useEffect(() => {
    fetchCategoryData();
  }, [slug]);

  const fetchCategoryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/blog/category/${slug}`);
      if (!response.ok) {
        throw new Error("Category not found");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Category Not Found
          </h1>
          <Link to="/blog" className="text-cyan-600 hover:underline">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const { category, articles, categories } = data;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link to="/blog" className="hover:text-cyan-600 transition-colors">
              Blog
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">{category?.name}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {category?.name}
          </h1>
          {category?.description && (
            <p className="text-lg text-slate-600 max-w-2xl">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Articles */}
          <div className="lg:col-span-2">
            {articles.data?.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {articles.data.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl">
                <p className="text-slate-500">
                  No articles in this category yet. Check back soon!
                </p>
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 mt-4 text-cyan-600 hover:text-cyan-700"
                >
                  View all articles
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Pagination */}
            {articles.last_page > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from(
                  { length: articles.last_page },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    className={`px-4 py-2 rounded-lg ${
                      page === articles.current_page
                        ? "bg-cyan-600 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <CategorySidebar
              categories={categories}
              currentCategory={category}
            />

            {/* CTA */}
            <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">Need Help?</h3>
              <p className="text-cyan-100 text-sm mb-4">
                Looking for custom solutions for your business?
              </p>
              <Link
                to="/contact"
                className="flex items-center justify-center gap-2 bg-white text-cyan-600 px-4 py-2 rounded-lg font-medium hover:bg-cyan-50 transition-colors"
              >
                Get in Touch
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
