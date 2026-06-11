import { Link } from 'react-router-dom';
import './StaggeredMenu.css';

const actions = [
  { label: 'Settings', href: '/settings', position: 'top-left' },
  { label: 'Home', href: '/', position: 'top-right' },
  { label: 'My Country', href: '/my-country', position: 'bottom-left' },
  { label: 'Predictions', href: '/predictions', position: 'bottom-right' },
];

export default function StaggeredMenu() {
  return (
    <div className="staggered-menu">
      {actions.map((action) => (
        <Link key={action.href + action.position} to={action.href} className={`corner-action ${action.position} cursor-target`}>
          {action.label}
        </Link>
      ))}
    </div>
  );
}
