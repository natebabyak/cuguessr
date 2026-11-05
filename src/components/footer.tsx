import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t p-8">
      <div className="mx-auto max-w-5xl">
        <p>2025-2026 &copy; Nate Babyak. All rights reserved.</p>
        <Link to="/">Home</Link>
        <Link to="/daily">Daily</Link>
        <Link to="/privacy">Privacy</Link>
        <Link to="/login">Login</Link>
        <Link to="/submit">Submit</Link>
      </div>
    </footer>
  );
}
