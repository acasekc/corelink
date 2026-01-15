import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";
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

export default function App() {
	return (
		<Router>
			<PublicLayout>
				<Routes>
					<Route path="/" element={<Index />} />
					<Route path="/about" element={<About />} />
					<Route path="/projects" element={<Projects />} />
					<Route path="/process" element={<Process />} />
					<Route path="/contact" element={<Contact />} />
					<Route path="/case-studies" element={<CaseStudies />} />
					<Route path="/case-studies/:case_study" element={<CaseStudyDetail />} />
					<Route path="/discovery" element={<DiscoveryChat />} />
					<Route path="/discovery/:sessionId/summary" element={<DiscoverySummary />} />
					<Route path="/admin/login" element={<Login />} />
					<Route path="/admin" element={<AdminDashboard />} />
					<Route path="/admin/discovery" element={<DiscoveryDashboard />} />
					<Route path="/admin/discovery/invites" element={<Invites />} />
					<Route path="/admin/discovery/invites/create" element={<CreateInvite />} />
					<Route path="/admin/discovery/sessions" element={<Sessions />} />
					<Route path="/admin/discovery/sessions/:sessionId" element={<SessionDetail />} />
					<Route path="/admin/discovery/plans" element={<Plans />} />
					<Route path="/admin/discovery/plans/:planId" element={<PlanDetail />} />
					<Route path="/admin/case-studies" element={<CaseStudiesList />} />
					<Route path="/admin/case-studies/create" element={<CaseStudyForm />} />
					<Route path="/admin/case-studies/:id/edit" element={<CaseStudyForm />} />
					<Route path="/admin/projects" element={<ProjectsList />} />
					<Route path="/admin/projects/create" element={<ProjectForm />} />
					<Route path="/admin/projects/:id/edit" element={<ProjectForm />} />
				</Routes>
			</PublicLayout>
		</Router>
	);
}