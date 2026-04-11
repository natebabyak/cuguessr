"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLogin() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin-auth", {
      method: "POST",
      body: JSON.stringify({ token }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Invalid token");
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="w-80">
        <CardHeader>
          <CardTitle>Admin Access</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            type="password"
            placeholder="Enter token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Verifying..." : "Login"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
