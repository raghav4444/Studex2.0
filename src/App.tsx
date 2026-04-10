import React, { useState, useEffect } from "react";
import { AuthProvider } from "./components/AuthProvider";
import { useAuth } from "./components/AuthProvider"; // Ensure this hook is correctly implemented and returns { user, loading }

// Lazy load components for better performance
const LandingPage = React.lazy(
  () => import("./components/Landing/LandingPage")
); // Ensure this file exists and exports a valid React component
const AuthPage = React.lazy(() => import("./components/Auth/AuthPage"));
const Header = React.lazy(() => import("./components/Layout/Header"));
const HomePage = React.lazy(() => import("./components/Home/HomePage"));
const NotesLibrary = React.lazy(
  () => import("./components/Notes/NotesLibrary")
);
const MentorshipPage = React.lazy(
  () => import("./components/Mentorship/MentorshipPage")
);
const SkillHubPage = React.lazy(
  () => import("./components/Skills/SkillHubPage")
);
const ProfilePage = React.lazy(
  () => import("./components/Profile/ProfilePage")
);
const EventsPage = React.lazy(() => import("./components/Events/EventsPage"));
const StudyGroupsPage = React.lazy(
  () => import("./components/StudyGroups/StudyGroupsPage")
);
const JobsPage = React.lazy(() => import("./components/Jobs/JobsPage"));
const NotificationsPage = React.lazy(
  () => import("./components/Notifications/NotificationsPage")
);
const ChatPage = React.lazy(() => import("./components/Chat/ChatPage"));
const ResetPasswordForm = React.lazy(() => import("./components/Auth/ResetPasswordForm"));

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [showAuth, setShowAuth] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Check if we're on a password reset URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');

    if (type === 'recovery' && accessToken && refreshToken) {
      setShowResetPassword(true);
    }
  }, []);

  // Show reset password form if we're on a reset URL
  if (showResetPassword) {
    return (
      <React.Suspense fallback={
        <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-500 rounded-lg animate-pulse mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      }>
        <ResetPasswordForm />
      </React.Suspense>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-500 rounded-lg animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Studex...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <React.Suspense
        fallback={
          <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-500 rounded-lg animate-pulse mx-auto mb-4"></div>
              <p className="text-gray-400">Loading Studex...</p>
            </div>
          </div>
        }
      >
        {showAuth ? (
          <AuthPage />
        ) : (
          <LandingPage onGetStarted={() => setShowAuth(true)} />
        )}
      </React.Suspense>
    );
  }

  const renderContent = () => {
    const LoadingFallback = () => (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800 animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );

    switch (activeTab) {
      case "home":
        return (
          <React.Suspense fallback={<LoadingFallback />}>
            <HomePage />
          </React.Suspense>
        );
      case "chat":
        return (
          <React.Suspense fallback={<LoadingFallback />}>
            <ChatPage />
          </React.Suspense>
        );
      case "notes":
        return (
          <React.Suspense fallback={<LoadingFallback />}>
            <NotesLibrary />
          </React.Suspense>
        );
      case "events":
        return (
          <React.Suspense fallback={<LoadingFallback />}>
            <EventsPage />
          </React.Suspense>
        );
      case "study-groups":
        return (
          <React.Suspense fallback={<LoadingFallback />}>
            <StudyGroupsPage />
          </React.Suspense>
        );
      case "mentorship":
        return (
          <React.Suspense fallback={<LoadingFallback />}>
            <MentorshipPage />
          </React.Suspense>
        );
      case "jobs":
        return (
          <React.Suspense fallback={<LoadingFallback />}>
            <JobsPage />
          </React.Suspense>
        );
      case "skills":
        return (
          <React.Suspense fallback={<LoadingFallback />}>
            <SkillHubPage />
          </React.Suspense>
        );
      case "notifications":
        return (
          <React.Suspense fallback={<LoadingFallback />}>
            <NotificationsPage />
          </React.Suspense>
        );
      case "profile":
        return (
          <React.Suspense fallback={<LoadingFallback />}>
            <ProfilePage />
          </React.Suspense>
        );
      default:
        return (
          <React.Suspense fallback={<LoadingFallback />}>
            <HomePage />
          </React.Suspense>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <React.Suspense
        fallback={
          <div className="bg-[#161b22] border-b border-gray-800 px-4 py-3 animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-48"></div>
          </div>
        }
      >
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
      </React.Suspense>
      <main className="pb-20 md:pb-8">{renderContent()}</main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
