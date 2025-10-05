import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import HomePage from "@/pages/home";
import CreateSessionPage from "@/pages/create-session";
import JoinSessionPage from "@/pages/join-session";
import PresenterView from "@/pages/presenter-view";
import ParticipantView from "@/pages/participant-view";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/create" component={CreateSessionPage} />
      <Route path="/join" component={JoinSessionPage} />
      <Route path="/presenter/:sessionId" component={PresenterView} />
      <Route path="/participant/:sessionId" component={ParticipantView} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
