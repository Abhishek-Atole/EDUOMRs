import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button.jsx';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <h1 className="text-4xl font-bold text-gray-400">404</h1>
      <p className="text-gray-500">Page not found</p>
      <Link to="/dashboard"><Button variant="outline">Go to Dashboard</Button></Link>
    </div>
  );
}
