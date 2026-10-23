import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t p-8">
      <div className="mx-auto max-w-5xl">
        <p>&copy; 2025-2026 Nate Babyak. All rights reserved.</p>
        <Link to="/">Home</Link>
        <Link to="/daily">Daily</Link>
        <Link to="/privacy">Privacy</Link>
        <Link to="/sign-in">Sign in</Link>
        <Link to="/submit">Submit</Link>
      </div>
    </footer>
  );
}
