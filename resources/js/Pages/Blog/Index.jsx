import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, Loader2 } from "lucide-react";

const ArticleCard = ({ article, featured = false }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (featured) {
    return (
      <Link
        to={`/blog/${article.slug}`}
        className="group block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
      >
        {article.featured_image && (
          <div className="aspect-video overflow-hidden">
            <img
              src={article.featured_image}
              alt={article.title}
              width={1200}
              height={675}
              loading="eager"
              fetchpriority="high"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-4 sm:p-6">
          {article.category && (
            <span className="inline-block px-2 py-0.5 sm:px-3 sm:py-1 bg-cyan-100 text-cyan-700 text-xs sm:text-sm font-medium rounded-full mb-2 sm:mb-3">
              {article.category.name}
            </span>
          )}
          <h3 className="text-base sm:text-xl font-bold text-slate-900 mb-2 group-hover:text-cyan-600 transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4 line-clamp-2">{article.excerpt}</p>
          <div className="flex items-center text-sm text-slate-500 gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(article.published_at)}
            </span>
            {article.reading_time && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {article.reading_time} min read
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/blog/${article.slug}`}
      className="group flex gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl hover:bg-slate-50 transition-colors"
    >
      {article.featured_image && (
        <div className="w-16 h-16 sm:w-24 sm:h-24 shrink-0 rounded-lg overflow-hidden">
          <img
            src={article.featured_image}
            alt={article.title}
            width={96}
            height={96}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {article.category && (
          <span className="text-xs font-medium text-cyan-600 uppercase tracking-wide">
            {article.category.name}
          </span>
        )}
        <h4 className="font-semibold text-sm sm:text-base text-slate-900 group-hover:text-cyan-600 transition-colors line-clamp-2">
          {article.title}
        </h4>
        <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 hidden sm:block">{article.excerpt}</p>
        <span className="text-xs text-slate-400 mt-1 block">
          {formatDate(article.published_at)}
        </span>
      </div>
    </Link>
  );
};

const CategorySidebar = ({ categories, currentCategory = null }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-4">Categories</h3>
      <div className="space-y-2">
        <Link
          to="/blog"
          className={`block px-3 py-2 rounded-lg transition-colors ${
            !currentCategory
              ? "bg-cyan-50 text-cyan-700"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          All Articles
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/blog/category/${category.slug}`}
            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
              currentCategory?.id === category.id
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

export default function BlogIndex() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    articles: { data: [] },
    categories: [],
    featuredArticles: [],
  });

  useEffect(() => {
    fetchBlogData();
  }, []);

  const fetchBlogData = async () => {
    try {
      const response = await fetch("/api/blog");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch blog data:", error);
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

  const { articles, categories, featuredArticles } = data;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200 py-8 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-2 sm:mb-4">
            Blog & Insights
          </h1>
          <p className="text-base sm:text-xl text-slate-600 max-w-2xl">
            Expert articles on web development, business software, and digital
            strategy for small businesses.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Articles */}
          <div className="lg:col-span-2 space-y-8">
            {/* Featured Articles */}
            {featuredArticles && featuredArticles.length > 0 && (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">
                  Featured Articles
                </h2>
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  {featuredArticles.slice(0, 2).map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      featured={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Articles */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">
                Latest Articles
              </h2>
              {articles.data?.length > 0 ? (
                <div className="space-y-4">
                  {articles.data.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl">
                  <p className="text-slate-500">
                    No articles published yet. Check back soon!
                  </p>
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <CategorySidebar categories={categories} />

            {/* Newsletter CTA */}
            <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">Stay Updated</h3>
              <p className="text-cyan-100 text-sm mb-4">
                Get the latest articles and insights delivered to your inbox.
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
