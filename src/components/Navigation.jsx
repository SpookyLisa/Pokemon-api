import { Link } from "react-router-dom";

function Navigation() {
  return (
    <nav className="navigation">
      <Link to="/">Builder</Link>
      <Link to="/teams">Teams</Link>
      <Link to="/liked">Liked</Link>
    </nav>
  );
}

export default Navigation;
