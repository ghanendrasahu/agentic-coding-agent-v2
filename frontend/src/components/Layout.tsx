import { Outlet, Link } from "react-router-dom";
import "./Layout.css";

export default function Layout() {
  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Agentic AI</h2>
        <Link to="/">Chat</Link>
        <Link to="/projects">Projects</Link>
        <Link to="/tasks">Tasks</Link>
        <Link to="/settings">Settings</Link>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
