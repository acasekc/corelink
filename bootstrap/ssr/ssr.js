import { _ as __vite_glob_0_57, a as __vite_glob_0_56, b as __vite_glob_0_55, c as __vite_glob_0_54, d as __vite_glob_0_53, e as __vite_glob_0_52, f as __vite_glob_0_41, g as __vite_glob_0_40, h as __vite_glob_0_39, i as __vite_glob_0_38, j as __vite_glob_0_32, k as __vite_glob_0_0 } from "./assets/route-public-B1wLJfPw.js";
import { _ as __vite_glob_0_5, a as __vite_glob_0_4, b as __vite_glob_0_3, c as __vite_glob_0_2, d as __vite_glob_0_1 } from "./assets/route-admin-articles-BR3NEGs1.js";
import { _ as __vite_glob_0_34, a as __vite_glob_0_33, b as __vite_glob_0_16, c as __vite_glob_0_9, d as __vite_glob_0_8, e as __vite_glob_0_7, f as __vite_glob_0_6 } from "./assets/route-admin-CNbJUzjN.js";
import { _ as __vite_glob_0_15, a as __vite_glob_0_14, b as __vite_glob_0_13, c as __vite_glob_0_12, d as __vite_glob_0_11, e as __vite_glob_0_10 } from "./assets/route-admin-discovery-BFP70kMO.js";
import { _ as __vite_glob_0_31, a as __vite_glob_0_30, b as __vite_glob_0_29, c as __vite_glob_0_28, d as __vite_glob_0_27, e as __vite_glob_0_26, f as __vite_glob_0_25, g as __vite_glob_0_24, h as __vite_glob_0_23, i as __vite_glob_0_22, j as __vite_glob_0_21, k as __vite_glob_0_20, l as __vite_glob_0_19, m as __vite_glob_0_18, n as __vite_glob_0_17 } from "./assets/route-admin-helpdesk-UCXZSv33.js";
import { _ as __vite_glob_0_37, a as __vite_glob_0_36, b as __vite_glob_0_35 } from "./assets/route-blog-jpwBX5H6.js";
import { _ as __vite_glob_0_43, a as __vite_glob_0_42 } from "./assets/route-discovery-1aL9jwJ0.js";
import { _ as __vite_glob_0_51, a as __vite_glob_0_50, b as __vite_glob_0_49, c as __vite_glob_0_48, d as __vite_glob_0_47, e as __vite_glob_0_46, f as __vite_glob_0_45, g as __vite_glob_0_44 } from "./assets/route-user-helpdesk-COSESte2.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { usePage, Link, createInertiaApp } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import ReactDOMServer from "react-dom/server";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Facebook } from "lucide-react";
import "react-router-dom";
import "react-markdown";
import "@lexical/react/LexicalComposer";
import "@lexical/react/LexicalRichTextPlugin";
import "@lexical/react/LexicalContentEditable";
import "@lexical/react/LexicalHistoryPlugin";
import "@lexical/react/LexicalComposerContext";
import "@lexical/react/LexicalErrorBoundary";
import "@lexical/rich-text";
import "@lexical/list";
import "@lexical/link";
import "@lexical/code";
import "@lexical/react/LexicalListPlugin";
import "@lexical/react/LexicalLinkPlugin";
import "@lexical/react/LexicalMarkdownShortcutPlugin";
import "@lexical/markdown";
import "@lexical/html";
import "@lexical/selection";
import "lexical";
import "remark-gfm";
const Logo = () => {
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.5 },
      className: "flex items-center",
      children: /* @__PURE__ */ jsx(
        "img",
        {
          src: "/images/logo_100_h.png",
          alt: "CoreLink",
          width: 400,
          height: 100,
          decoding: "async",
          loading: "eager",
          className: "h-12 sm:h-16 md:h-20 w-auto"
        }
      )
    }
  );
};
const InertiaHeader = () => {
  const { url } = usePage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = [
    { label: "Projects", href: "/projects" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Blog", href: "/blog" },
    { label: "Process", href: "/process" },
    { label: "About", href: "/about" }
  ];
  const closeMenu = () => setMobileMenuOpen(false);
  const pathname = url.split("?")[0];
  return /* @__PURE__ */ jsx(
    "header",
    {
      className: "fixed top-0 left-0 right-0 z-50",
      style: {
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
      },
      children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4", children: [
        /* @__PURE__ */ jsxs("nav", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx(Link, { href: "/", className: "shrink-0", children: /* @__PURE__ */ jsx(Logo, {}) }),
          /* @__PURE__ */ jsx("div", { className: "hidden md:flex items-center gap-8", children: navItems.map((item) => /* @__PURE__ */ jsx(
            Link,
            {
              href: item.href,
              style: {
                color: pathname === item.href ? "#06b6d4" : "#9ca3af",
                fontSize: "14px",
                fontWeight: "500",
                textDecoration: "none"
              },
              className: "hover:text-cyan-400 transition-colors",
              children: item.label
            },
            item.label
          )) }),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: "/contact",
              className: "hidden md:block",
              style: {
                padding: "8px 24px",
                backgroundColor: "#06b6d4",
                color: "white",
                fontWeight: "500",
                borderRadius: "8px",
                textDecoration: "none"
              },
              children: "Get In Touch"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setMobileMenuOpen(!mobileMenuOpen),
              className: "md:hidden p-2 text-gray-400 hover:text-white transition-colors",
              "aria-label": "Toggle menu",
              children: /* @__PURE__ */ jsx(
                "svg",
                {
                  className: "w-6 h-6",
                  fill: "none",
                  stroke: "currentColor",
                  viewBox: "0 0 24 24",
                  children: mobileMenuOpen ? /* @__PURE__ */ jsx(
                    "path",
                    {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: 2,
                      d: "M6 18L18 6M6 6l12 12"
                    }
                  ) : /* @__PURE__ */ jsx(
                    "path",
                    {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: 2,
                      d: "M4 6h16M4 12h16M4 18h16"
                    }
                  )
                }
              )
            }
          )
        ] }),
        /* @__PURE__ */ jsx(AnimatePresence, { children: mobileMenuOpen && /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { opacity: 0, height: 0 },
            animate: { opacity: 1, height: "auto" },
            exit: { opacity: 0, height: 0 },
            transition: { duration: 0.2 },
            className: "md:hidden overflow-hidden",
            children: /* @__PURE__ */ jsxs("div", { className: "py-4 space-y-1 border-t border-white/10 mt-3", children: [
              navItems.map((item) => /* @__PURE__ */ jsx(
                Link,
                {
                  href: item.href,
                  onClick: closeMenu,
                  className: "block py-3 px-2 rounded-lg transition-colors",
                  style: {
                    color: pathname === item.href ? "#06b6d4" : "#d1d5db",
                    backgroundColor: pathname === item.href ? "rgba(6, 182, 212, 0.1)" : "transparent",
                    fontSize: "16px",
                    fontWeight: "500",
                    textDecoration: "none"
                  },
                  children: item.label
                },
                item.label
              )),
              /* @__PURE__ */ jsx(
                Link,
                {
                  href: "/contact",
                  onClick: closeMenu,
                  className: "block mt-4 text-center",
                  style: {
                    padding: "12px 24px",
                    backgroundColor: "#06b6d4",
                    color: "white",
                    fontWeight: "600",
                    borderRadius: "8px",
                    textDecoration: "none"
                  },
                  children: "Get In Touch"
                }
              )
            ] })
          }
        ) })
      ] })
    }
  );
};
const InertiaFooter = () => {
  return /* @__PURE__ */ jsx("footer", { className: "relative py-16 border-t border-white/5", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row items-center justify-between gap-6", children: [
    /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        viewport: { once: true },
        children: /* @__PURE__ */ jsx(Link, { href: "/", children: /* @__PURE__ */ jsx(Logo, {}) })
      }
    ),
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        viewport: { once: true },
        className: "flex items-center gap-6",
        children: [
          /* @__PURE__ */ jsx(Link, { href: "/terms", className: "text-muted-foreground hover:text-foreground text-sm transition", children: "Terms of Service" }),
          /* @__PURE__ */ jsx(Link, { href: "/privacy", className: "text-muted-foreground hover:text-foreground text-sm transition", children: "Privacy Policy" }),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://instagram.com/Corelink.dev",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-muted-foreground hover:text-foreground transition",
              "aria-label": "Instagram",
              children: /* @__PURE__ */ jsx(Instagram, { className: "w-5 h-5" })
            }
          ),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://www.facebook.com/corelink.dev",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-muted-foreground hover:text-foreground transition",
              "aria-label": "Facebook",
              children: /* @__PURE__ */ jsx(Facebook, { className: "w-5 h-5" })
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      motion.p,
      {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        viewport: { once: true },
        className: "text-muted-foreground text-sm",
        children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          " CoreLink Development LLC. All rights reserved."
        ]
      }
    )
  ] }) }) });
};
function InertiaPublicLayout({ children }) {
  const { url } = usePage();
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground flex flex-col", children: [
    /* @__PURE__ */ jsx(InertiaHeader, {}),
    /* @__PURE__ */ jsx("main", { id: "main-content", className: "pt-20 flex-1", children }),
    /* @__PURE__ */ jsx(InertiaFooter, {})
  ] });
}
createServer(
  (page) => createInertiaApp({
    page,
    title: (title) => title ? `${title} | CoreLink Development` : "CoreLink Development",
    render: ReactDOMServer.renderToString,
    resolve: (name) => {
      const pages = /* @__PURE__ */ Object.assign({ "./Pages/About.jsx": __vite_glob_0_0, "./Pages/Admin/Articles/Categories/Index.jsx": __vite_glob_0_1, "./Pages/Admin/Articles/Create.jsx": __vite_glob_0_2, "./Pages/Admin/Articles/Edit.jsx": __vite_glob_0_3, "./Pages/Admin/Articles/Index.jsx": __vite_glob_0_4, "./Pages/Admin/Articles/Settings.jsx": __vite_glob_0_5, "./Pages/Admin/CaseStudies/Form.jsx": __vite_glob_0_6, "./Pages/Admin/CaseStudies/List.jsx": __vite_glob_0_7, "./Pages/Admin/ChangePassword.jsx": __vite_glob_0_8, "./Pages/Admin/Dashboard.jsx": __vite_glob_0_9, "./Pages/Admin/Discovery/CreateInvite.jsx": __vite_glob_0_10, "./Pages/Admin/Discovery/Invites.jsx": __vite_glob_0_11, "./Pages/Admin/Discovery/PlanDetail.jsx": __vite_glob_0_12, "./Pages/Admin/Discovery/Plans.jsx": __vite_glob_0_13, "./Pages/Admin/Discovery/SessionDetail.jsx": __vite_glob_0_14, "./Pages/Admin/Discovery/Sessions.jsx": __vite_glob_0_15, "./Pages/Admin/DiscoveryDashboard.jsx": __vite_glob_0_16, "./Pages/Admin/Helpdesk/CreateTicket.jsx": __vite_glob_0_17, "./Pages/Admin/Helpdesk/Dashboard.jsx": __vite_glob_0_18, "./Pages/Admin/Helpdesk/InvoiceCreate.jsx": __vite_glob_0_19, "./Pages/Admin/Helpdesk/InvoiceDetail.jsx": __vite_glob_0_20, "./Pages/Admin/Helpdesk/InvoiceEdit.jsx": __vite_glob_0_21, "./Pages/Admin/Helpdesk/InvoicesList.jsx": __vite_glob_0_22, "./Pages/Admin/Helpdesk/ProjectDetail.jsx": __vite_glob_0_23, "./Pages/Admin/Helpdesk/ProjectForm.jsx": __vite_glob_0_24, "./Pages/Admin/Helpdesk/ProjectsList.jsx": __vite_glob_0_25, "./Pages/Admin/Helpdesk/Settings.jsx": __vite_glob_0_26, "./Pages/Admin/Helpdesk/TicketDetail.jsx": __vite_glob_0_27, "./Pages/Admin/Helpdesk/TicketsList.jsx": __vite_glob_0_28, "./Pages/Admin/Helpdesk/UserDetail.jsx": __vite_glob_0_29, "./Pages/Admin/Helpdesk/UserForm.jsx": __vite_glob_0_30, "./Pages/Admin/Helpdesk/UsersList.jsx": __vite_glob_0_31, "./Pages/Admin/Login.jsx": __vite_glob_0_32, "./Pages/Admin/Projects/Form.jsx": __vite_glob_0_33, "./Pages/Admin/Projects/List.jsx": __vite_glob_0_34, "./Pages/Blog/Category.jsx": __vite_glob_0_35, "./Pages/Blog/Index.jsx": __vite_glob_0_36, "./Pages/Blog/Show.jsx": __vite_glob_0_37, "./Pages/CaseStudies.jsx": __vite_glob_0_38, "./Pages/CaseStudiesList.jsx": __vite_glob_0_39, "./Pages/CaseStudyDetail.jsx": __vite_glob_0_40, "./Pages/Contact.jsx": __vite_glob_0_41, "./Pages/Discovery/Chat.jsx": __vite_glob_0_42, "./Pages/Discovery/Summary.jsx": __vite_glob_0_43, "./Pages/Helpdesk/ChangePassword.jsx": __vite_glob_0_44, "./Pages/Helpdesk/CreateTicket.jsx": __vite_glob_0_45, "./Pages/Helpdesk/Dashboard.jsx": __vite_glob_0_46, "./Pages/Helpdesk/Login.jsx": __vite_glob_0_47, "./Pages/Helpdesk/Profile.jsx": __vite_glob_0_48, "./Pages/Helpdesk/ProjectDetail.jsx": __vite_glob_0_49, "./Pages/Helpdesk/TicketDetail.jsx": __vite_glob_0_50, "./Pages/Helpdesk/TicketsList.jsx": __vite_glob_0_51, "./Pages/Home.jsx": __vite_glob_0_52, "./Pages/Index.jsx": __vite_glob_0_53, "./Pages/Privacy.jsx": __vite_glob_0_54, "./Pages/Process.jsx": __vite_glob_0_55, "./Pages/Projects.jsx": __vite_glob_0_56, "./Pages/Terms.jsx": __vite_glob_0_57 });
      const module = pages[`./Pages/${name}.jsx`];
      module.default.layout = module.default.layout || ((page2) => /* @__PURE__ */ jsx(InertiaPublicLayout, { children: page2 }));
      return module;
    },
    setup: ({ App, props }) => /* @__PURE__ */ jsx(App, { ...props })
  })
);
