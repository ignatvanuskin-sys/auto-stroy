import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import PageTransition from "@/components/fx/PageTransition";
import Calculator from "@/pages/Calculator";
import {
  CrmAnalytics,
  CrmDashboard,
  CrmLeadDetail,
  CrmLeads,
  CrmProposals,
  CrmSettings,
  CrmTasks,
} from "@/pages/CrmPages";
import {
  AboutPage,
  ContactsPage,
  FaqPage,
  ProcessPage,
  ProjectDetailPage,
  ProjectsPage,
  ServicesPage,
} from "@/pages/MarketingPages";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import BootSplash from "./components/BootSplash";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/projects/:slug" component={ProjectDetailPage} />
      <Route path="/process" component={ProcessPage} />
      <Route path="/calculator" component={Calculator} />
      <Route path="/about" component={AboutPage} />
      <Route path="/faq" component={FaqPage} />
      <Route path="/contacts" component={ContactsPage} />
      <Route path="/crm/dashboard" component={CrmDashboard} />
      <Route path="/crm/leads" component={CrmLeads} />
      <Route path="/crm/leads/:id" component={CrmLeadDetail} />
      <Route path="/crm/proposals" component={CrmProposals} />
      <Route path="/crm/tasks" component={CrmTasks} />
      <Route path="/crm/analytics" component={CrmAnalytics} />
      <Route path="/crm/settings" component={CrmSettings} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <BootSplash />
          <Toaster />
          <PageTransition>
            <Router />
          </PageTransition>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
