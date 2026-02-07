import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import "react";
import { Head, Link } from "@inertiajs/react";
import { ArrowRight, Calendar, Clock, Linkedin, Facebook, ArrowLeft } from "lucide-react";
function SeoHead({ meta }) {
  return /* @__PURE__ */ jsxs(Head, { title: meta?.title, children: [
    meta?.description && /* @__PURE__ */ jsx("meta", { name: "description", content: meta.description }),
    meta?.title && /* @__PURE__ */ jsx("meta", { property: "og:title", content: `${meta.title} | CoreLink Development` }),
    meta?.description && /* @__PURE__ */ jsx("meta", { property: "og:description", content: meta.description }),
    /* @__PURE__ */ jsx("meta", { property: "og:type", content: "website" }),
    /* @__PURE__ */ jsx("meta", { property: "og:site_name", content: "CoreLink Development" })
  ] });
}
const ArticleCard$1 = ({ article }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  return /* @__PURE__ */ jsxs(
    Link,
    {
      href: `/blog/${article.slug}`,
      className: "group block bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow",
      children: [
        article.featured_image && /* @__PURE__ */ jsx("div", { className: "aspect-video overflow-hidden", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: article.featured_image,
            alt: article.title,
            className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-slate-900 mb-2 group-hover:text-cyan-600 transition-colors", children: article.title }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-600 mb-4 line-clamp-2 text-sm", children: article.excerpt }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center text-sm text-slate-500 gap-4", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4" }),
              formatDate(article.published_at)
            ] }),
            article.reading_time && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }),
              article.reading_time,
              " min"
            ] })
          ] })
        ] })
      ]
    }
  );
};
const CategorySidebar$1 = ({ categories, currentCategory }) => {
  return /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-6 shadow-sm", children: [
    /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-900 mb-4", children: "Categories" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          href: "/blog",
          className: "block px-3 py-2 rounded-lg transition-colors text-slate-600 hover:bg-slate-50",
          children: "All Articles"
        }
      ),
      categories.map((category) => /* @__PURE__ */ jsxs(
        Link,
        {
          href: `/blog/category/${category.slug}`,
          className: `flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${currentCategory?.slug === category.slug ? "bg-cyan-50 text-cyan-700" : "text-slate-600 hover:bg-slate-50"}`,
          children: [
            /* @__PURE__ */ jsx("span", { children: category.name }),
            /* @__PURE__ */ jsx("span", { className: "text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full", children: category.articles_count })
          ]
        },
        category.id
      ))
    ] })
  ] });
};
function BlogCategory({ meta, category, articles = { data: [] }, categories = [] }) {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-50", children: [
    /* @__PURE__ */ jsx(SeoHead, { meta }),
    /* @__PURE__ */ jsx("div", { className: "bg-white border-b border-slate-200 py-12", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-6", children: [
      /* @__PURE__ */ jsxs("nav", { className: "flex items-center gap-2 text-sm text-slate-500 mb-4", children: [
        /* @__PURE__ */ jsx(Link, { href: "/blog", className: "hover:text-cyan-600 transition-colors", children: "Blog" }),
        /* @__PURE__ */ jsx("span", { children: "/" }),
        /* @__PURE__ */ jsx("span", { className: "text-slate-900 font-medium", children: category?.name })
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "text-3xl md:text-4xl font-bold text-slate-900 mb-4", children: category?.name }),
      category?.description && /* @__PURE__ */ jsx("p", { className: "text-lg text-slate-600 max-w-2xl", children: category.description })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "max-w-6xl mx-auto px-6 py-12", children: /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2", children: [
        articles.data?.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 gap-6", children: articles.data.map((article) => /* @__PURE__ */ jsx(ArticleCard$1, { article }, article.id)) }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-12 bg-white rounded-xl", children: [
          /* @__PURE__ */ jsx("p", { className: "text-slate-500", children: "No articles in this category yet. Check back soon!" }),
          /* @__PURE__ */ jsxs(
            Link,
            {
              href: "/blog",
              className: "inline-flex items-center gap-2 mt-4 text-cyan-600 hover:text-cyan-700",
              children: [
                "View all articles",
                /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
              ]
            }
          )
        ] }),
        articles.last_page > 1 && /* @__PURE__ */ jsx("div", { className: "flex justify-center gap-2 mt-8", children: Array.from(
          { length: articles.last_page },
          (_, i) => i + 1
        ).map((page) => /* @__PURE__ */ jsx(
          "button",
          {
            className: `px-4 py-2 rounded-lg ${page === articles.current_page ? "bg-cyan-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`,
            children: page
          },
          page
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsx(
          CategorySidebar$1,
          {
            categories,
            currentCategory: category
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl p-6 text-white", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-bold text-lg mb-2", children: "Need Help?" }),
          /* @__PURE__ */ jsx("p", { className: "text-cyan-100 text-sm mb-4", children: "Looking for custom solutions for your business?" }),
          /* @__PURE__ */ jsxs(
            Link,
            {
              href: "/contact",
              className: "flex items-center justify-center gap-2 bg-white text-cyan-600 px-4 py-2 rounded-lg font-medium hover:bg-cyan-50 transition-colors",
              children: [
                "Get in Touch",
                /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
              ]
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}
const __vite_glob_0_35 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: BlogCategory
}, Symbol.toStringTag, { value: "Module" }));
const ArticleCard = ({ article, featured = false }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  if (featured) {
    return /* @__PURE__ */ jsxs(
      Link,
      {
        href: `/blog/${article.slug}`,
        className: "group block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow",
        children: [
          article.featured_image && /* @__PURE__ */ jsx("div", { className: "aspect-video overflow-hidden", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: article.featured_image,
              alt: article.title,
              width: 1200,
              height: 675,
              loading: "eager",
              fetchpriority: "high",
              className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6", children: [
            article.category && /* @__PURE__ */ jsx("span", { className: "inline-block px-2 py-0.5 sm:px-3 sm:py-1 bg-cyan-100 text-cyan-700 text-xs sm:text-sm font-medium rounded-full mb-2 sm:mb-3", children: article.category.name }),
            /* @__PURE__ */ jsx("h3", { className: "text-base sm:text-xl font-bold text-slate-900 mb-2 group-hover:text-cyan-600 transition-colors line-clamp-2", children: article.title }),
            /* @__PURE__ */ jsx("p", { className: "text-sm sm:text-base text-slate-600 mb-3 sm:mb-4 line-clamp-2", children: article.excerpt }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center text-sm text-slate-500 gap-4", children: [
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4" }),
                formatDate(article.published_at)
              ] }),
              article.reading_time && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }),
                article.reading_time,
                " min read"
              ] })
            ] })
          ] })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    Link,
    {
      href: `/blog/${article.slug}`,
      className: "group flex gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl hover:bg-slate-50 transition-colors",
      children: [
        article.featured_image && /* @__PURE__ */ jsx("div", { className: "w-16 h-16 sm:w-24 sm:h-24 shrink-0 rounded-lg overflow-hidden", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: article.featured_image,
            alt: article.title,
            width: 96,
            height: 96,
            loading: "lazy",
            className: "w-full h-full object-cover"
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          article.category && /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-cyan-600 uppercase tracking-wide", children: article.category.name }),
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-sm sm:text-base text-slate-900 group-hover:text-cyan-600 transition-colors line-clamp-2", children: article.title }),
          /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm text-slate-500 line-clamp-2 hidden sm:block", children: article.excerpt }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-400 mt-1 block", children: formatDate(article.published_at) })
        ] })
      ]
    }
  );
};
const CategorySidebar = ({ categories, currentCategory = null }) => {
  return /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-6 shadow-sm", children: [
    /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-900 mb-4", children: "Categories" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          href: "/blog",
          className: `block px-3 py-2 rounded-lg transition-colors ${!currentCategory ? "bg-cyan-50 text-cyan-700" : "text-slate-600 hover:bg-slate-50"}`,
          children: "All Articles"
        }
      ),
      categories.map((category) => /* @__PURE__ */ jsxs(
        Link,
        {
          href: `/blog/category/${category.slug}`,
          className: `flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${currentCategory?.id === category.id ? "bg-cyan-50 text-cyan-700" : "text-slate-600 hover:bg-slate-50"}`,
          children: [
            /* @__PURE__ */ jsx("span", { children: category.name }),
            /* @__PURE__ */ jsx("span", { className: "text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full", children: category.articles_count })
          ]
        },
        category.id
      ))
    ] })
  ] });
};
function BlogIndex({ meta, articles = { data: [] }, categories = [], featuredArticles = [] }) {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-50", children: [
    /* @__PURE__ */ jsx(SeoHead, { meta }),
    /* @__PURE__ */ jsx("div", { className: "bg-white border-b border-slate-200 py-8 sm:py-16", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-2 sm:mb-4", children: "Blog & Insights" }),
      /* @__PURE__ */ jsx("p", { className: "text-base sm:text-xl text-slate-600 max-w-2xl", children: "Expert articles on web development, business software, and digital strategy for small businesses." })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12", children: /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-3 gap-6 sm:gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-8", children: [
        featuredArticles && featuredArticles.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6", children: "Featured Articles" }),
          /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 gap-4 sm:gap-6", children: featuredArticles.slice(0, 2).map((article) => /* @__PURE__ */ jsx(
            ArticleCard,
            {
              article,
              featured: true
            },
            article.id
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6", children: "Latest Articles" }),
          articles.data?.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-4", children: articles.data.map((article) => /* @__PURE__ */ jsx(ArticleCard, { article }, article.id)) }) : /* @__PURE__ */ jsx("div", { className: "text-center py-12 bg-white rounded-xl", children: /* @__PURE__ */ jsx("p", { className: "text-slate-500", children: "No articles published yet. Check back soon!" }) }),
          articles.last_page > 1 && /* @__PURE__ */ jsx("div", { className: "flex justify-center gap-2 mt-8", children: Array.from(
            { length: articles.last_page },
            (_, i) => i + 1
          ).map((page) => /* @__PURE__ */ jsx(
            "button",
            {
              className: `px-4 py-2 rounded-lg ${page === articles.current_page ? "bg-cyan-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`,
              children: page
            },
            page
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsx(CategorySidebar, { categories }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl p-6 text-white", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-bold text-lg mb-2", children: "Stay Updated" }),
          /* @__PURE__ */ jsx("p", { className: "text-cyan-100 text-sm mb-4", children: "Get the latest articles and insights delivered to your inbox." }),
          /* @__PURE__ */ jsxs(
            Link,
            {
              href: "/contact",
              className: "flex items-center justify-center gap-2 bg-white text-cyan-600 px-4 py-2 rounded-lg font-medium hover:bg-cyan-50 transition-colors",
              children: [
                "Get in Touch",
                /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
              ]
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}
const __vite_glob_0_36 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: BlogIndex
}, Symbol.toStringTag, { value: "Module" }));
const XIcon = ({ className }) => /* @__PURE__ */ jsx(
  "svg",
  {
    viewBox: "0 0 24 24",
    className,
    fill: "currentColor",
    "aria-hidden": "true",
    children: /* @__PURE__ */ jsx("path", { d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" })
  }
);
const ShareButton = ({ icon: Icon, label, onClick, className }) => /* @__PURE__ */ jsx(
  "button",
  {
    onClick,
    className: `p-2 rounded-lg transition-colors ${className}`,
    "aria-label": label,
    children: /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5" })
  }
);
const RelatedArticleCard = ({ article }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };
  return /* @__PURE__ */ jsxs(
    Link,
    {
      href: `/blog/${article.slug}`,
      className: "group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow",
      children: [
        article.featured_image && /* @__PURE__ */ jsx("div", { className: "aspect-video overflow-hidden", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: article.featured_image,
            alt: article.title,
            width: 800,
            height: 450,
            loading: "lazy",
            className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-slate-900 group-hover:text-cyan-600 transition-colors line-clamp-2", children: article.title }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 mt-1", children: formatDate(article.published_at) })
        ] })
      ]
    }
  );
};
const processArticleContent = (content) => {
  if (!content) return "";
  let processed = content.replace(/{{FEATURED_IMAGE}}/g, "");
  processed = processed.replace(/<figure /g, () => {
    const floatClass = Math.random() > 0.5 ? "float-left" : "float-right";
    return `<figure class="${floatClass}" `;
  });
  processed = processed.replace(/<img (?![^>]*class=)/g, () => {
    const floatClass = Math.random() > 0.5 ? "float-left" : "float-right";
    return `<img class="${floatClass}" `;
  });
  return processed;
};
function BlogShow({ meta, article, relatedArticles = [], recentArticles = [], categories = [] }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  const shareOnX = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(article?.title || "");
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
  if (!article) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-slate-50 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-slate-900 mb-4", children: "Article Not Found" }),
      /* @__PURE__ */ jsx(Link, { href: "/blog", className: "text-cyan-600 hover:underline", children: "Back to Blog" })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-50", children: [
    /* @__PURE__ */ jsx(SeoHead, { meta }),
    /* @__PURE__ */ jsx("div", { className: "bg-slate-900 pt-8 pb-16", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-6", children: [
      /* @__PURE__ */ jsxs("nav", { className: "flex items-center gap-2 text-sm text-slate-400 mb-6", children: [
        /* @__PURE__ */ jsx(Link, { href: "/blog", className: "hover:text-cyan-400 transition-colors", children: "Blog" }),
        article.category && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("span", { children: "/" }),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: `/blog/category/${article.category.slug}`,
              className: "hover:text-cyan-400 transition-colors",
              children: article.category.name
            }
          )
        ] })
      ] }),
      article.category && /* @__PURE__ */ jsx("span", { className: "inline-block px-3 py-1 bg-cyan-600 text-white text-sm font-medium rounded-full mb-4", children: article.category.name }),
      /* @__PURE__ */ jsx("h1", { className: "text-3xl md:text-4xl font-bold text-white mb-6", children: article.title }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 text-slate-400", children: [
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4" }),
          formatDate(article.published_at)
        ] }),
        article.reading_time && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }),
          article.reading_time,
          " min read"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-6", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm text-slate-500 mr-2", children: "Share:" }),
        /* @__PURE__ */ jsx(
          ShareButton,
          {
            icon: XIcon,
            label: "Share on X",
            onClick: shareOnX,
            className: "bg-slate-800 hover:bg-slate-900 hover:text-white text-slate-400"
          }
        ),
        /* @__PURE__ */ jsx(
          ShareButton,
          {
            icon: Linkedin,
            label: "Share on LinkedIn",
            onClick: shareOnLinkedIn,
            className: "bg-slate-800 hover:bg-blue-700 hover:text-white text-slate-400"
          }
        ),
        /* @__PURE__ */ jsx(
          ShareButton,
          {
            icon: Facebook,
            label: "Share on Facebook",
            onClick: shareOnFacebook,
            className: "bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-400"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-6 py-12", children: [
      /* @__PURE__ */ jsxs("article", { className: "bg-white rounded-2xl shadow-lg p-8 md:p-12", children: [
        article.excerpt && /* @__PURE__ */ jsx("p", { className: "text-xl text-slate-600 mb-8 pb-8 border-b border-slate-200 italic", children: article.excerpt }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "prose prose-lg max-w-none\n              [&_h2]:text-slate-900 [&_h2]:font-semibold [&_h2]:text-2xl [&_h2]:mt-8 [&_h2]:mb-4\n              [&_h3]:text-slate-900 [&_h3]:font-semibold [&_h3]:text-xl [&_h3]:mt-6 [&_h3]:mb-3\n              [&_p]:text-slate-700 [&_p]:leading-relaxed [&_p]:mb-4\n              [&_a]:text-cyan-600 [&_a]:no-underline hover:[&_a]:underline\n              [&_strong]:text-slate-900 [&_strong]:font-semibold\n              [&_code]:text-cyan-700 [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm\n              [&_pre]:bg-slate-900 [&_pre]:text-slate-100\n              [&_ul]:text-slate-700 [&_ol]:text-slate-700 [&_li]:text-slate-700\n              [&_blockquote]:border-l-4 [&_blockquote]:border-l-cyan-500 [&_blockquote]:text-slate-600 [&_blockquote]:pl-4 [&_blockquote]:italic\n              [&_figure]:w-1/4 [&_figure]:my-4\n              [&_figure.float-left]:float-left [&_figure.float-left]:mr-6 [&_figure.float-left]:mb-4 [&_figure.float-left]:ml-0\n              [&_figure.float-right]:float-right [&_figure.float-right]:ml-6 [&_figure.float-right]:mb-4 [&_figure.float-right]:mr-0\n              [&_figure_img]:w-full [&_figure_img]:rounded-lg [&_figure_img]:shadow-md\n              [&_img]:rounded-lg [&_img]:shadow-md\n              [&_img.float-left]:float-left [&_img.float-left]:w-1/4 [&_img.float-left]:mr-6 [&_img.float-left]:mb-4\n              [&_img.float-right]:float-right [&_img.float-right]:w-1/4 [&_img.float-right]:ml-6 [&_img.float-right]:mb-4\n              [&_figcaption]:text-slate-500 [&_figcaption]:text-sm [&_figcaption]:text-center [&_figcaption]:mt-2",
            dangerouslySetInnerHTML: { __html: processArticleContent(article.content) }
          }
        ),
        article.meta_keywords && /* @__PURE__ */ jsxs("div", { className: "mt-12 pt-8 border-t border-slate-200", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3", children: "Tags" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: article.meta_keywords.split(",").map((tag, index) => /* @__PURE__ */ jsx(
            "span",
            {
              className: "px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm",
              children: tag.trim()
            },
            index
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-8", children: /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/blog",
          className: "inline-flex items-center gap-2 text-slate-600 hover:text-cyan-600 transition-colors",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
            "Back to all articles"
          ]
        }
      ) })
    ] }),
    relatedArticles && relatedArticles.length > 0 && /* @__PURE__ */ jsx("div", { className: "bg-white py-12", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-slate-900 mb-8", children: "Related Articles" }),
      /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-3 gap-6", children: relatedArticles.map((relatedArticle) => /* @__PURE__ */ jsx(
        RelatedArticleCard,
        {
          article: relatedArticle
        },
        relatedArticle.id
      )) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "bg-slate-900 py-16", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-6 text-center text-white", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold mb-4", children: "Ready to transform your business?" }),
      /* @__PURE__ */ jsx("p", { className: "text-lg text-slate-400 mb-8", children: "Let's discuss how we can help you build powerful web solutions." }),
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/contact",
          className: "inline-flex items-center gap-2 bg-cyan-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-cyan-500 transition-colors",
          children: [
            "Get in Touch",
            /* @__PURE__ */ jsx(ArrowRight, { className: "w-5 h-5" })
          ]
        }
      )
    ] }) })
  ] });
}
const __vite_glob_0_37 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: BlogShow
}, Symbol.toStringTag, { value: "Module" }));
export {
  SeoHead as S,
  __vite_glob_0_37 as _,
  __vite_glob_0_36 as a,
  __vite_glob_0_35 as b
};
