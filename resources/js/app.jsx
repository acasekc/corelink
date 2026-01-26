import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";
import AdminLayout from "./components/AdminLayout";
import Index from "./Pages/Index";

// Lazy load public routes (non-critical)
const About = React.lazy(() => import("./Pages/About"));
const Projects = React.lazy(() => import("./Pages/Projects"));
const Process = React.lazy(() => import("./Pages/Process"));
const Contact = React.lazy(() => import("./Pages/Contact"));
const CaseStudies = React.lazy(() => import("./Pages/CaseStudies"));
const CaseStudyDetail = React.lazy(() => import("./Pages/CaseStudyDetail"));
const Terms = React.lazy(() => import("./Pages/Terms"));
const Privacy = React.lazy(() => import("./Pages/Privacy"));
const DiscoveryChat = React.lazy(() => import("./Pages/Discovery/Chat"));
const DiscoverySummary = React.lazy(() => import("./Pages/Discovery/Summary"));

// Lazy load blog routes
const BlogIndex = React.lazy(() => import("./Pages/Blog/Index"));
const BlogCategory = React.lazy(() => import("./Pages/Blog/Category"));
const BlogShow = React.lazy(() => import("./Pages/Blog/Show"));

// Lazy load admin routes
const Login = React.lazy(() => import("./Pages/Admin/Login"));
const AdminDashboard = React.lazy(() => import("./Pages/Admin/Dashboard"));
const AdminChangePassword = React.lazy(() => import("./Pages/Admin/ChangePassword"));
const DiscoveryDashboard = React.lazy(() => import("./Pages/Admin/DiscoveryDashboard"));
const Invites = React.lazy(() => import("./Pages/Admin/Discovery/Invites"));
const CreateInvite = React.lazy(() => import("./Pages/Admin/Discovery/CreateInvite"));
const Sessions = React.lazy(() => import("./Pages/Admin/Discovery/Sessions"));
const SessionDetail = React.lazy(() => import("./Pages/Admin/Discovery/SessionDetail"));
const Plans = React.lazy(() => import("./Pages/Admin/Discovery/Plans"));
const PlanDetail = React.lazy(() => import("./Pages/Admin/Discovery/PlanDetail"));
const CaseStudiesList = React.lazy(() => import("./Pages/Admin/CaseStudies/List"));
const CaseStudyForm = React.lazy(() => import("./Pages/Admin/CaseStudies/Form"));
const ProjectsList = React.lazy(() => import("./Pages/Admin/Projects/List"));
const ProjectForm = React.lazy(() => import("./Pages/Admin/Projects/Form"));

// Lazy load admin helpdesk routes
const HelpdeskDashboard = React.lazy(() => import("./Pages/Admin/Helpdesk/Dashboard"));
const HelpdeskTicketsList = React.lazy(() => import("./Pages/Admin/Helpdesk/TicketsList"));
const HelpdeskTicketDetail = React.lazy(() => import("./Pages/Admin/Helpdesk/TicketDetail"));
const HelpdeskCreateTicket = React.lazy(() => import("./Pages/Admin/Helpdesk/CreateTicket"));
const HelpdeskProjectsList = React.lazy(() => import("./Pages/Admin/Helpdesk/ProjectsList"));
const HelpdeskProjectDetail = React.lazy(() => import("./Pages/Admin/Helpdesk/ProjectDetail"));
const HelpdeskProjectForm = React.lazy(() => import("./Pages/Admin/Helpdesk/ProjectForm"));
const HelpdeskUsersList = React.lazy(() => import("./Pages/Admin/Helpdesk/UsersList"));
const HelpdeskUserForm = React.lazy(() => import("./Pages/Admin/Helpdesk/UserForm"));
const HelpdeskUserDetail = React.lazy(() => import("./Pages/Admin/Helpdesk/UserDetail"));
const HelpdeskInvoicesList = React.lazy(() => import("./Pages/Admin/Helpdesk/InvoicesList"));
const HelpdeskInvoiceDetail = React.lazy(() => import("./Pages/Admin/Helpdesk/InvoiceDetail"));
const HelpdeskInvoiceCreate = React.lazy(() => import("./Pages/Admin/Helpdesk/InvoiceCreate"));
const HelpdeskInvoiceEdit = React.lazy(() => import("./Pages/Admin/Helpdesk/InvoiceEdit"));
const HelpdeskSettings = React.lazy(() => import("./Pages/Admin/Helpdesk/Settings"));

// Lazy load user helpdesk routes
const UserHelpdeskDashboard = React.lazy(() => import("./Pages/Helpdesk/Dashboard"));
const UserHelpdeskTicketsList = React.lazy(() => import("./Pages/Helpdesk/TicketsList"));
const UserHelpdeskTicketDetail = React.lazy(() => import("./Pages/Helpdesk/TicketDetail"));
const UserHelpdeskCreateTicket = React.lazy(() => import("./Pages/Helpdesk/CreateTicket"));
const UserHelpdeskProjectDetail = React.lazy(() => import("./Pages/Helpdesk/ProjectDetail"));
const UserHelpdeskLogin = React.lazy(() => import("./Pages/Helpdesk/Login"));
const UserHelpdeskProfile = React.lazy(() => import("./Pages/Helpdesk/Profile"));
const UserHelpdeskChangePassword = React.lazy(() => import("./Pages/Helpdesk/ChangePassword"));

// Lazy load admin articles routes
const AdminArticlesIndex = React.lazy(() => import("./Pages/Admin/Articles/Index"));
const AdminArticlesCreate = React.lazy(() => import("./Pages/Admin/Articles/Create"));
const AdminArticlesEdit = React.lazy(() => import("./Pages/Admin/Articles/Edit"));
const AdminArticlesCategories = React.lazy(() => import("./Pages/Admin/Articles/Categories/Index"));
const AdminArticlesSettings = React.lazy(() => import("./Pages/Admin/Articles/Settings"));

const LoadingFallback = () => (
	<div className="flex items-center justify-center h-screen bg-slate-900">
		<div className="text-center">
			<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
			<p className="text-slate-300">Loading…</p>
		</div>
	</div>
);

export default function App() {
	return (
		<Router>
			<Suspense fallback={<LoadingFallback />}>
				<Routes>
					{/* Public Routes */}
					<Route path="/" element={<PublicLayout><Index /></PublicLayout>} />
					<Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
					<Route path="/projects" element={<PublicLayout><Projects /></PublicLayout>} />
					<Route path="/process" element={<PublicLayout><Process /></PublicLayout>} />
					<Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
					<Route path="/case-studies" element={<PublicLayout><CaseStudies /></PublicLayout>} />
					<Route path="/case-studies/:case_study" element={<PublicLayout><CaseStudyDetail /></PublicLayout>} />
					<Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
					<Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
					<Route path="/discovery" element={<PublicLayout><DiscoveryChat /></PublicLayout>} />
					<Route path="/discovery/:sessionId/summary" element={<PublicLayout><DiscoverySummary /></PublicLayout>} />

					{/* Blog Routes */}
					<Route path="/blog" element={<PublicLayout><BlogIndex /></PublicLayout>} />
					<Route path="/blog/category/:slug" element={<PublicLayout><BlogCategory /></PublicLayout>} />
					<Route path="/blog/:slug" element={<PublicLayout><BlogShow /></PublicLayout>} />

					{/* User Helpdesk Routes - Authenticated users (not admin-only) */}
					<Route path="/helpdesk/login" element={<AdminLayout><UserHelpdeskLogin /></AdminLayout>} />
					<Route path="/helpdesk" element={<AdminLayout><UserHelpdeskDashboard /></AdminLayout>} />
					<Route path="/helpdesk/profile" element={<AdminLayout><UserHelpdeskProfile /></AdminLayout>} />
					<Route path="/helpdesk/change-password" element={<AdminLayout><UserHelpdeskChangePassword /></AdminLayout>} />
					<Route path="/helpdesk/projects/:projectId" element={<AdminLayout><UserHelpdeskProjectDetail /></AdminLayout>} />
					<Route path="/helpdesk/tickets" element={<AdminLayout><UserHelpdeskTicketsList /></AdminLayout>} />
					<Route path="/helpdesk/tickets/create" element={<AdminLayout><UserHelpdeskCreateTicket /></AdminLayout>} />
					<Route path="/helpdesk/tickets/:ticketId" element={<AdminLayout><UserHelpdeskTicketDetail /></AdminLayout>} />

					{/* Admin Routes - No public header/footer */}
					<Route path="/admin/login" element={<AdminLayout><Login /></AdminLayout>} />
					<Route path="/admin/change-password" element={<AdminLayout><AdminChangePassword /></AdminLayout>} />
					<Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
					<Route path="/admin/discovery" element={<AdminLayout><DiscoveryDashboard /></AdminLayout>} />
					<Route path="/admin/discovery/invites" element={<AdminLayout><Invites /></AdminLayout>} />
					<Route path="/admin/discovery/invites/create" element={<AdminLayout><CreateInvite /></AdminLayout>} />
					<Route path="/admin/discovery/sessions" element={<AdminLayout><Sessions /></AdminLayout>} />
					<Route path="/admin/discovery/sessions/:sessionId" element={<AdminLayout><SessionDetail /></AdminLayout>} />
					<Route path="/admin/discovery/plans" element={<AdminLayout><Plans /></AdminLayout>} />
					<Route path="/admin/discovery/plans/:planId" element={<AdminLayout><PlanDetail /></AdminLayout>} />
					<Route path="/admin/case-studies" element={<AdminLayout><CaseStudiesList /></AdminLayout>} />
					<Route path="/admin/case-studies/create" element={<AdminLayout><CaseStudyForm /></AdminLayout>} />
					<Route path="/admin/case-studies/:id/edit" element={<AdminLayout><CaseStudyForm /></AdminLayout>} />
					<Route path="/admin/projects" element={<AdminLayout><ProjectsList /></AdminLayout>} />
					<Route path="/admin/projects/create" element={<AdminLayout><ProjectForm /></AdminLayout>} />
					<Route path="/admin/projects/:id/edit" element={<AdminLayout><ProjectForm /></AdminLayout>} />

					{/* Admin Blog/Articles Routes */}
					<Route path="/admin/articles" element={<AdminLayout><AdminArticlesIndex /></AdminLayout>} />
					<Route path="/admin/articles/create" element={<AdminLayout><AdminArticlesCreate /></AdminLayout>} />
					<Route path="/admin/articles/:id/edit" element={<AdminLayout><AdminArticlesEdit /></AdminLayout>} />
					<Route path="/admin/articles/categories" element={<AdminLayout><AdminArticlesCategories /></AdminLayout>} />
					<Route path="/admin/articles/settings" element={<AdminLayout><AdminArticlesSettings /></AdminLayout>} />

					{/* Admin Helpdesk Routes */}
					<Route path="/admin/helpdesk" element={<AdminLayout><HelpdeskDashboard /></AdminLayout>} />
					<Route path="/admin/helpdesk/tickets" element={<AdminLayout><HelpdeskTicketsList /></AdminLayout>} />
					<Route path="/admin/helpdesk/tickets/create" element={<AdminLayout><HelpdeskCreateTicket /></AdminLayout>} />
					<Route path="/admin/helpdesk/tickets/:ticketId" element={<AdminLayout><HelpdeskTicketDetail /></AdminLayout>} />
					<Route path="/admin/helpdesk/projects" element={<AdminLayout><HelpdeskProjectsList /></AdminLayout>} />
					<Route path="/admin/helpdesk/projects/create" element={<AdminLayout><HelpdeskProjectForm /></AdminLayout>} />
					<Route path="/admin/helpdesk/projects/:projectId" element={<AdminLayout><HelpdeskProjectDetail /></AdminLayout>} />
					<Route path="/admin/helpdesk/projects/:projectId/keys" element={<AdminLayout><HelpdeskProjectDetail /></AdminLayout>} />
					<Route path="/admin/helpdesk/users" element={<AdminLayout><HelpdeskUsersList /></AdminLayout>} />
					<Route path="/admin/helpdesk/users/create" element={<AdminLayout><HelpdeskUserForm /></AdminLayout>} />
					<Route path="/admin/helpdesk/users/:userId" element={<AdminLayout><HelpdeskUserDetail /></AdminLayout>} />
					<Route path="/admin/helpdesk/users/:userId/edit" element={<AdminLayout><HelpdeskUserForm /></AdminLayout>} />
					<Route path="/admin/helpdesk/invoices" element={<AdminLayout><HelpdeskInvoicesList /></AdminLayout>} />
					<Route path="/admin/helpdesk/invoices/create" element={<AdminLayout><HelpdeskInvoiceCreate /></AdminLayout>} />
					<Route path="/admin/helpdesk/invoices/:invoiceId" element={<AdminLayout><HelpdeskInvoiceDetail /></AdminLayout>} />
					<Route path="/admin/helpdesk/invoices/:invoiceId/edit" element={<AdminLayout><HelpdeskInvoiceEdit /></AdminLayout>} />
					<Route path="/admin/helpdesk/settings" element={<AdminLayout><HelpdeskSettings /></AdminLayout>} />
				</Routes>
			</Suspense>
		</Router>
	);
}