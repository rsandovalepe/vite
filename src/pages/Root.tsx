import { Outlet, Navigate, useLocation } from 'react-router-dom';

function RootLayout() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  const token = localStorage.getItem('token');
  const isPublicGallery = /^\/qrcodes\/[^/]+\/gallery$/.test(
    location.pathname,
  );
  const roles = (JSON.parse(localStorage.getItem('roles') || '[]') as {
    name: string;
  }[]).map((r) => r.name);
  const isUser = roles.includes('USER') && !roles.includes('ADMIN');

  if (!token && !isLogin && !isPublicGallery) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <main className={isLogin || isUser ? 'login-main' : undefined}>
      <Outlet />
    </main>
  );
}

export default RootLayout;
