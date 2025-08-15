import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const roles = (JSON.parse(localStorage.getItem('roles') || '[]') as {
      name: string;
    }[]).map((r) => r.name);
    if (roles.includes('USER') && !roles.includes('ADMIN')) {
      navigate('/events', { replace: true });
    } else {
      navigate('/event-home', { replace: true });
    }
  }, [navigate]);

  return null;
}

export default HomePage;

