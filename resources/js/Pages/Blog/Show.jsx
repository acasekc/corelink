import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  Share2,
  Linkedin,
  Facebook,
  Loader2,
} from "lucide-react";

// Custom X (formerly Twitter) icon
const XIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const ShareButton = ({ icon: Icon, label, onClick, className }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-lg transition-colors ${className}`}
    aria-label={label}
  >
    <Icon className="w-5 h-5" />
  </button>
);

const RelatedArticleCard = ({ article }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Link
      to={`/blog/${article.slug}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
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
      <div className="p-4">
        <h4 className="font-semibold text-slate-900 group-hover:text-cyan-600 transition-colors line-clamp-2">
          {article.title}
        </h4>
        <p className="text-sm text-slate-500 mt-1">
          {formatDate(article.published_at)}
        </p>
      </div>
    </Link>
  );
};

// Process article content to add random float classes to images and figures
const processArticleContent = (content) => {
  if (!content) return '';
  
  // Remove the placeholder
  let processed = content.replace(/{{FEATURED_IMAGE}}/g, '');
  
  // Add random float class to each figure (which contains images)
  processed = processed.replace(/<figure /g, () => {
    const floatClass = Math.random() > 0.5 ? 'float-left' : 'float-right';
    return `<figure class="${floatClass}" `;
  });
  
  // Also handle standalone images not in figures
  processed = processed.replace(/<img (?![^>]*class=)/g, () => {
    const floatClass = Math.random() > 0.5 ? 'float-left' : 'float-right';
    return `<img class="${floatClass}" `;
  });
  
  return processed;
};

export default function BlogShow() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    article: null,
    relatedArticles: [],
    recentArticles: [],
    categories: [],
  });

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/blog/article/${slug}`);
      if (!response.ok) {
        throw new Error("Article not found");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const shareOnX = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(data.article?.title || "");
    window.open(
      `https://x.com/intent/tweet?url=${url}&text=${text}`,
      "_blank"
    );
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      "_blank"
    );
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
      </div>
    );
  }

  if (error || !data.article) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Article Not Found
          </h1>
          <Link to="/blog" className="text-cyan-600 hover:underline">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const { article, relatedArticles, recentArticles, categories } = data;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Article Header */}
      <div className="bg-slate-900 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
            <Link to="/blog" className="hover:text-cyan-400 transition-colors">
              Blog
            </Link>
            {article.category && (
              <>
                <span>/</span>
                <Link
                  to={`/blog/category/${article.category.slug}`}
                  className="hover:text-cyan-400 transition-colors"
                >
                  {article.category.name}
                </Link>
              </>
            )}
          </nav>

          {/* Category Badge */}
          {article.category && (
            <span className="inline-block px-3 py-1 bg-cyan-600 text-white text-sm font-medium rounded-full mb-4">
              {article.category.name}
            </span>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(article.published_at)}
            </span>
            {article.reading_time && (
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {article.reading_time} min read
              </span>
            )}
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-2 mt-6">
            <span className="text-sm text-slate-500 mr-2">Share:</span>
            <ShareButton
              icon={XIcon}
              label="Share on X"
              onClick={shareOnX}
              className="bg-slate-800 hover:bg-slate-900 hover:text-white text-slate-400"
            />
            <ShareButton
              icon={Linkedin}
              label="Share on LinkedIn"
              onClick={shareOnLinkedIn}
              className="bg-slate-800 hover:bg-blue-700 hover:text-white text-slate-400"
            />
            <ShareButton
              icon={Facebook}
              label="Share on Facebook"
              onClick={shareOnFacebook}
              className="bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <article className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-xl text-slate-600 mb-8 pb-8 border-b border-slate-200 italic">
              {article.excerpt}
            </p>
          )}

          {/* Content - rendered as HTML from Lexical editor */}
          <div 
            className="prose prose-lg max-w-none
              [&_h2]:text-slate-900 [&_h2]:font-semibold [&_h2]:text-2xl [&_h2]:mt-8 [&_h2]:mb-4
              [&_h3]:text-slate-900 [&_h3]:font-semibold [&_h3]:text-xl [&_h3]:mt-6 [&_h3]:mb-3
              [&_p]:text-slate-700 [&_p]:leading-relaxed [&_p]:mb-4
              [&_a]:text-cyan-600 [&_a]:no-underline hover:[&_a]:underline
              [&_strong]:text-slate-900 [&_strong]:font-semibold
              [&_code]:text-cyan-700 [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm
              [&_pre]:bg-slate-900 [&_pre]:text-slate-100
              [&_ul]:text-slate-700 [&_ol]:text-slate-700 [&_li]:text-slate-700
              [&_blockquote]:border-l-4 [&_blockquote]:border-l-cyan-500 [&_blockquote]:text-slate-600 [&_blockquote]:pl-4 [&_blockquote]:italic
              [&_figure]:w-1/4 [&_figure]:my-4
              [&_figure.float-left]:float-left [&_figure.float-left]:mr-6 [&_figure.float-left]:mb-4 [&_figure.float-left]:ml-0
              [&_figure.float-right]:float-right [&_figure.float-right]:ml-6 [&_figure.float-right]:mb-4 [&_figure.float-right]:mr-0
              [&_figure_img]:w-full [&_figure_img]:rounded-lg [&_figure_img]:shadow-md
              [&_img]:rounded-lg [&_img]:shadow-md
              [&_img.float-left]:float-left [&_img.float-left]:w-1/4 [&_img.float-left]:mr-6 [&_img.float-left]:mb-4
              [&_img.float-right]:float-right [&_img.float-right]:w-1/4 [&_img.float-right]:ml-6 [&_img.float-right]:mb-4
              [&_figcaption]:text-slate-500 [&_figcaption]:text-sm [&_figcaption]:text-center [&_figcaption]:mt-2"
            dangerouslySetInnerHTML={{ __html: processArticleContent(article.content) }}
          />

          {/* Tags */}
          {article.meta_keywords && (
            <div className="mt-12 pt-8 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.meta_keywords.split(",").map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Back Link */}
        <div className="mt-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-cyan-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all articles
          </Link>
        </div>
      </div>

      {/* Related Articles */}
      {relatedArticles && relatedArticles.length > 0 && (
        <div className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">
              Related Articles
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <RelatedArticleCard
                  key={relatedArticle.id}
                  article={relatedArticle}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to transform your business?
          </h2>
          <p className="text-lg text-slate-400 mb-8">
            Let&apos;s discuss how we can help you build powerful web solutions.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-cyan-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-cyan-500 transition-colors"
          >
            Get in Touch
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
