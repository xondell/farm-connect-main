import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sprout, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — AgroHelp" },
      {
        name: "description",
        content:
          "Sign in to AgroHelp to track tickets, receive notifications, and view chat history.",
      },
      { property: "og:title", content: "Sign in — AgroHelp" },
      {
        property: "og:description",
        content:
          "Sign in to AgroHelp to track tickets, receive notifications, and view chat history.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/" });
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created!");
    navigate({ to: "/" });
  }

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error(error.message || "Google sign-in error");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted/40 px-6 py-10">
      <div className="mx-auto max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>
        <div className="rounded-3xl border bg-card p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">AgroHelp</h1>
              <p className="text-sm text-muted-foreground">Sign in or create an account</p>
            </div>
          </div>

          <Button
            variant="outline"
            className="mb-4 w-full"
            onClick={handleGoogle}
            disabled={loading}
          >
            Continue with Google
          </Button>
          <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form className="space-y-4" onSubmit={handleSignIn}>
                <div>
                  <Label htmlFor="email-in">Email</Label>
                  <Input
                    id="email-in"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="pw-in">Password</Label>
                  <Input
                    id="pw-in"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  Sign in
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form className="space-y-4" onSubmit={handleSignUp}>
                <div>
                  <Label htmlFor="name-up">Name</Label>
                  <Input
                    id="name-up"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email-up">Email</Label>
                  <Input
                    id="email-up"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="pw-up">Password (min. 6 characters)</Label>
                  <Input
                    id="pw-up"
                    type="password"
                    minLength={6}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
