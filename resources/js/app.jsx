import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";
import AdminLayout from "./components/AdminLayout";
import Index from "./Pages/Index";
import About from "./Pages/About";
import Projects from "./Pages/Projects";
import Process from "./Pages/Process";
import Contact from "./Pages/Contact";
import CaseStudies from "./Pages/CaseStudies";
import CaseStudyDetail from "./Pages/CaseStudyDetail";
import Login from "./Pages/Admin/Login";
import AdminDashboard from "./Pages/Admin/Dashboard";
import DiscoveryDashboard from "./Pages/Admin/DiscoveryDashboard";
import Invites from "./Pages/Admin/Discovery/Invites";
import CreateInvite from "./Pages/Admin/Discovery/CreateInvite";
import Sessions from "./Pages/Admin/Discovery/Sessions";
import SessionDetail from "./Pages/Admin/Discovery/SessionDetail";
import Plans from "./Pages/Admin/Discovery/Plans";
import PlanDetail from "./Pages/Admin/Discovery/PlanDetail";
import CaseStudiesList from "./Pages/Admin/CaseStudies/List";
import CaseStudyForm from "./Pages/Admin/CaseStudies/Form";
import ProjectsList from "./Pages/Admin/Projects/List";
import ProjectForm from "./Pages/Admin/Projects/Form";
import DiscoveryChat from "./Pages/Discovery/Chat";
import DiscoverySummary from "./Pages/Discovery/Summary";
// Admin Helpdesk imports
import HelpdeskDashboard from "./Pages/Admin/Helpdesk/Dashboard";
import HelpdeskTicketsList from "./Pages/Admin/Helpdesk/TicketsList";
import HelpdeskTicketDetail from "./Pages/Admin/Helpdesk/TicketDetail";
import HelpdeskProjectsList from "./Pages/Admin/Helpdesk/ProjectsList";
import HelpdeskProjectDetail from "./Pages/Admin/Helpdesk/ProjectDetail";
import HelpdeskProjectForm from "./Pages/Admin/Helpdesk/ProjectForm";
import HelpdeskUsersList from "./Pages/Admin/Helpdesk/UsersList";
import HelpdeskUserForm from "./Pages/Admin/Helpdesk/UserForm";
import HelpdeskUserDetail from "./Pages/Admin/Helpdesk/UserDetail";
// User Helpdesk imports
import UserHelpdeskDashboard from "./Pages/Helpdesk/Dashboard";
import UserHelpdeskTicketsList from "./Pages/Helpdesk/TicketsList";
import UserHelpdeskTicketDetail from "./Pages/Helpdesk/TicketDetail";
import UserHelpdeskCreateTicket from "./Pages/Helpdesk/CreateTicket";
import UserHelpdeskProjectDetail from "./Pages/Helpdesk/ProjectDetail";
import UserHelpdeskLogin from "./Pages/Helpdesk/Login";
import UserHelpdeskProfile from "./Pages/Helpdesk/Profile";
import UserHelpdeskChangePassword from "./Pages/Helpdesk/ChangePassword";
import AdminChangePassword from "./Pages/Admin/ChangePassword";

export default function App() {
	return (
		<Router>
			<Routes>
				{/* Public Routes */}
				<Route path="/" element={<PublicLayout><Index /></PublicLayout>} />
				<Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
				<Route path="/projects" element={<PublicLayout><Projects /></PublicLayout>} />
				<Route path="/process" element={<PublicLayout><Process /></PublicLayout>} />
				<Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
				<Route path="/case-studies" element={<PublicLayout><CaseStudies /></PublicLayout>} />
				<Route path="/case-studies/:case_study" element={<PublicLayout><CaseStudyDetail /></PublicLayout>} />
				<Route path="/discovery" element={<PublicLayout><DiscoveryChat /></PublicLayout>} />
				<Route path="/discovery/:sessionId/summary" element={<PublicLayout><DiscoverySummary /></PublicLayout>} />

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

				{/* Admin Helpdesk Routes */}
				<Route path="/admin/helpdesk" element={<AdminLayout><HelpdeskDashboard /></AdminLayout>} />
				<Route path="/admin/helpdesk/tickets" element={<AdminLayout><HelpdeskTicketsList /></AdminLayout>} />
				<Route path="/admin/helpdesk/tickets/:ticketId" element={<AdminLayout><HelpdeskTicketDetail /></AdminLayout>} />
				<Route path="/admin/helpdesk/projects" element={<AdminLayout><HelpdeskProjectsList /></AdminLayout>} />
				<Route path="/admin/helpdesk/projects/create" element={<AdminLayout><HelpdeskProjectForm /></AdminLayout>} />
				<Route path="/admin/helpdesk/projects/:projectId" element={<AdminLayout><HelpdeskProjectDetail /></AdminLayout>} />
				<Route path="/admin/helpdesk/projects/:projectId/keys" element={<AdminLayout><HelpdeskProjectDetail /></AdminLayout>} />
				<Route path="/admin/helpdesk/users" element={<AdminLayout><HelpdeskUsersList /></AdminLayout>} />
				<Route path="/admin/helpdesk/users/create" element={<AdminLayout><HelpdeskUserForm /></AdminLayout>} />
				<Route path="/admin/helpdesk/users/:userId" element={<AdminLayout><HelpdeskUserDetail /></AdminLayout>} />
				<Route path="/admin/helpdesk/users/:userId/edit" element={<AdminLayout><HelpdeskUserForm /></AdminLayout>} />
			</Routes>
		</Router>
	);
}