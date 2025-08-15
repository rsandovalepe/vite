import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/sonner';
import RequireAuth from './components/RequireAuth';
import RootLayout from './pages/Root';
import HomePage from './pages/Home';
import EventHomePage from './pages/EventHome';
import EventsPage from './pages/Events';
import EventSettingsPage from './pages/EventSettings';
import LoginPage from './pages/Login';
import QRCodesPage from './pages/QRCodes';
import QRCodeDetailPage from './pages/QRCodeDetail';
import QRCodeEditPage from './pages/QRCodeEdit';
import QRCodeGalleryPage from './pages/QRCodeGallery';
import FTPConnectionsPage from './pages/settings/FTPConnections';
import FTPConnectionFormPage from './pages/settings/FTPConnectionForm';
import FolderConnectionsPage from './pages/settings/FolderConnections';
import FolderConnectionFormPage from './pages/settings/FolderConnectionForm';
import PermissionsPage from './pages/Permissions';
import RolesPage from './pages/Roles';
import PermissionFormPage from './pages/PermissionForm';
import RoleFormPage from './pages/RoleForm';
import UsersPage from './pages/Users';
import UserFormPage from './pages/UserForm';
import SettingsPage from './pages/settings';
import TwoFactorSetupPage from './pages/settings/TwoFactorSetup';
import EventLayout from './components/EventLayout';
import AdminLayout from './components/AdminLayout';
import SettingsLayout from './components/SettingsLayout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    id: 'root',
    children: [
      { index: true, element: <HomePage /> },
      {
        element: <AdminLayout />,
        children: [
          {
            element: <EventLayout />,
            children: [
              { path: 'event-home', element: <EventHomePage /> },
              { path: 'events', element: <EventsPage /> },
              { path: 'events/settings', element: <EventSettingsPage /> },
            ],
          },
          {
            element: <SettingsLayout />,
            children: [
              {
                path: 'settings',
                element: (
                  <RequireAuth>
                    <SettingsPage />
                  </RequireAuth>
                ),
              },
              {
                path: 'settings/2fa',
                element: (
                  <RequireAuth>
                    <TwoFactorSetupPage />
                  </RequireAuth>
                ),
              },
            ],
          },
          {
            path: 'qrcodes',
            element: (
              <RequireAuth>
                <QRCodesPage />
              </RequireAuth>
            ),
          },
          {
            path: 'qrcodes/:uuid',
            element: (
              <RequireAuth>
                <QRCodeDetailPage />
              </RequireAuth>
            ),
          },
          {
            path: 'qrcodes/:uuid/edit',
            element: (
              <RequireAuth>
                <QRCodeEditPage />
              </RequireAuth>
            ),
          },
          {
            path: 'rbac/permissions',
            element: (
              <RequireAuth>
                <PermissionsPage />
              </RequireAuth>
            ),
          },
          {
            path: 'rbac/permissions/new',
            element: (
              <RequireAuth>
                <PermissionFormPage />
              </RequireAuth>
            ),
          },
          {
            path: 'rbac/permissions/:id',
            element: (
              <RequireAuth>
                <PermissionFormPage readOnly />
              </RequireAuth>
            ),
          },
          {
            path: 'rbac/permissions/:id/edit',
            element: (
              <RequireAuth>
                <PermissionFormPage />
              </RequireAuth>
            ),
          },
          {
            path: 'rbac/roles',
            element: (
              <RequireAuth>
                <RolesPage />
              </RequireAuth>
            ),
          },
          {
            path: 'rbac/roles/new',
            element: (
              <RequireAuth>
                <RoleFormPage />
              </RequireAuth>
            ),
          },
          {
            path: 'rbac/roles/:id',
            element: (
              <RequireAuth>
                <RoleFormPage readOnly />
              </RequireAuth>
            ),
          },
          {
            path: 'rbac/roles/:id/edit',
            element: (
              <RequireAuth>
                <RoleFormPage />
              </RequireAuth>
            ),
          },
          {
            path: 'rbac/users',
            element: (
              <RequireAuth>
                <UsersPage />
              </RequireAuth>
            ),
          },
          {
            path: 'rbac/users/new',
            element: (
              <RequireAuth>
                <UserFormPage />
              </RequireAuth>
            ),
          },
          {
            path: 'rbac/users/:id',
            element: (
              <RequireAuth>
                <UserFormPage readOnly />
              </RequireAuth>
            ),
          },
          {
            path: 'rbac/users/:id/edit',
            element: (
              <RequireAuth>
                <UserFormPage />
              </RequireAuth>
            ),
          },
          {
            path: 'settings/ftp',
            element: (
              <RequireAuth>
                <FTPConnectionsPage />
              </RequireAuth>
            ),
          },
          {
            path: 'settings/ftp/new',
            element: (
              <RequireAuth>
                <FTPConnectionFormPage />
              </RequireAuth>
            ),
          },
          {
            path: 'settings/ftp/:id',
            element: (
              <RequireAuth>
                <FTPConnectionFormPage readOnly />
              </RequireAuth>
            ),
          },
          {
            path: 'settings/ftp/:id/edit',
            element: (
              <RequireAuth>
                <FTPConnectionFormPage />
              </RequireAuth>
            ),
          },
          {
            path: 'settings/folder',
            element: (
              <RequireAuth>
                <FolderConnectionsPage />
              </RequireAuth>
            ),
          },
          {
            path: 'settings/folder/new',
            element: (
              <RequireAuth>
                <FolderConnectionFormPage />
              </RequireAuth>
            ),
          },
          {
            path: 'settings/folder/:id',
            element: (
              <RequireAuth>
                <FolderConnectionFormPage readOnly />
              </RequireAuth>
            ),
          },
          {
            path: 'settings/folder/:id/edit',
            element: (
              <RequireAuth>
                <FolderConnectionFormPage />
              </RequireAuth>
            ),
          },
        ],
      },
      { path: 'login', element: <LoginPage /> },
      {
        path: 'qrcodes/:uuid/gallery',
        element: <QRCodeGalleryPage />, // Public access for gallery
      },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
