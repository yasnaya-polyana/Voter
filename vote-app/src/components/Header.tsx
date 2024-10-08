// src/components/Header.tsx
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="navbar bg-base-100 shadow-lg">
      <div className="container mx-auto">
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Voter</h2>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1">
            <li><Link href="/" className="btn btn-ghost normal-case">Home</Link></li>
            <li><Link href="/login" className="btn btn-ghost normal-case">Login</Link></li>
            <li><Link href="/information" className="btn btn-ghost normal-case">Information</Link></li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;