import { NavLink } from 'react-router-dom';
import { useAuth } from '../../state/AuthProvider.jsx';
import './PillNav.css';

const items = [
  { label: 'Home', href: '/' },
  { label: 'My Country', href: '/my-country' },
  { label: 'Predictions', href: '/predictions' },
  { label: 'Highlights', href: '/highlights' },
];

export default function PillNav() {
  const { profile, signOut } = useAuth();

  return (
    <nav className="pill-nav">
      <NavLink to="/" className="brand cursor-target">
        World Cha Cup
      </NavLink>
      <div className="pill-links">
        {items.map((item) => (
          <NavLink key={item.href} to={item.href} className="pill-link cursor-target">
            {item.label}
          </NavLink>
        ))}
      </div>
      <div className="nav-user">
        {profile?.avatar && <img className="nav-avatar" src={profile.avatar} alt="" />}
        <span>{profile?.username}</span>
        <button className="cursor-target nav-button" onClick={signOut}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
