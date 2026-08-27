import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext.jsx';
import { AppLayout } from './layouts/AppLayout.jsx';
import { Protected } from './components/Protected.jsx';
import { Spinner } from './components/ui.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage } from './pages/AuthPages.jsx';

const FeedPage = lazy(() => import('./pages/FeedPage.jsx').then((m) => ({ default: m.FeedPage })));
const ExplorePage = lazy(() => import('./pages/ExplorePage.jsx').then((m) => ({ default: m.ExplorePage })));
const VenuesPage = lazy(() => import('./pages/VenuePages.jsx').then((m) => ({ default: m.VenuesPage })));
const VenueDetailPage = lazy(() => import('./pages/VenuePages.jsx').then((m) => ({ default: m.VenueDetailPage })));
const GroupsPage = lazy(() => import('./pages/PeoplePages.jsx').then((m) => ({ default: m.GroupsPage })));
const GroupDetailPage = lazy(() => import('./pages/PeoplePages.jsx').then((m) => ({ default: m.GroupDetailPage })));
const StudentsPage = lazy(() => import('./pages/PeoplePages.jsx').then((m) => ({ default: m.StudentsPage })));
const StudentProfilePage = lazy(() => import('./pages/PeoplePages.jsx').then((m) => ({ default: m.StudentProfilePage })));
const UploadPage = lazy(() => import('./pages/UploadPage.jsx').then((m) => ({ default: m.UploadPage })));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage.jsx').then((m) => ({ default: m.PostDetailPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx').then((m) => ({ default: m.ProfilePage })));
const NotificationsPage = lazy(() => import('./pages/MiscPages.jsx').then((m) => ({ default: m.NotificationsPage })));
const ArchivePage = lazy(() => import('./pages/MiscPages.jsx').then((m) => ({ default: m.ArchivePage })));
const SemesterPage = lazy(() => import('./pages/MiscPages.jsx').then((m) => ({ default: m.SemesterPage })));
const SearchPage = lazy(() => import('./pages/MiscPages.jsx').then((m) => ({ default: m.SearchPage })));
const PrivacyPage = lazy(() => import('./pages/MiscPages.jsx').then((m) => ({ default: m.PrivacyPage })));
const GuidelinesPage = lazy(() => import('./pages/MiscPages.jsx').then((m) => ({ default: m.GuidelinesPage })));
const AdminLayout = lazy(() => import('./pages/AdminPages.jsx').then((m) => ({ default: m.AdminLayout })));
const AdminOverview = lazy(() => import('./pages/AdminPages.jsx').then((m) => ({ default: m.AdminOverview })));
const AdminReports = lazy(() => import('./pages/AdminPages.jsx').then((m) => ({ default: m.AdminReports })));
const AdminPosts = lazy(() => import('./pages/AdminPages.jsx').then((m) => ({ default: m.AdminPosts })));
const AdminUsers = lazy(() => import('./pages/AdminPages.jsx').then((m) => ({ default: m.AdminUsers })));
const AdminCatalog = lazy(() => import('./pages/AdminPages.jsx').then((m) => ({ default: m.AdminCatalog })));
const AdminAudit = lazy(() => import('./pages/AdminPages.jsx').then((m) => ({ default: m.AdminAudit })));
const AdminSettings = lazy(() => import('./pages/AdminPages.jsx').then((m) => ({ default: m.AdminSettings })));

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 30_000, retry: 1 } },
});

function Fallback() {
  return <Spinner />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<Fallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
              <Route element={<AppLayout />}>
                <Route path="/home" element={<FeedPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/venues" element={<VenuesPage />} />
                <Route path="/venue/:slug" element={<VenueDetailPage />} />
                <Route path="/groups" element={<GroupsPage />} />
                <Route path="/groups/:id" element={<GroupDetailPage />} />
                <Route path="/students" element={<StudentsPage />} />
                <Route path="/student/:id" element={<StudentProfilePage />} />
                <Route path="/post/:id" element={<PostDetailPage />} />
                <Route path="/archive" element={<ArchivePage />} />
                <Route path="/semester/:slug" element={<SemesterPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/guidelines" element={<GuidelinesPage />} />
                <Route
                  path="/upload"
                  element={
                    <Protected>
                      <UploadPage />
                    </Protected>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <Protected>
                      <ProfilePage />
                    </Protected>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <Protected>
                      <NotificationsPage />
                    </Protected>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <Protected roles={['admin', 'teacher']}>
                      <AdminLayout />
                    </Protected>
                  }
                >
                  <Route index element={<AdminOverview />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="posts" element={<AdminPosts />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="catalog" element={<AdminCatalog />} />
                  <Route path="audit" element={<AdminAudit />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
