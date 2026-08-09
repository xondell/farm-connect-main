import { Link } from "@tanstack/react-router";
import { LogIn, LogOut, ShieldCheck, TicketCheck, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth, signOut } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function AccountNav({ variant = "consumer" }: { variant?: "consumer" | "farmer" }) {
  const { user, isAdmin, loading } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user || variant !== "farmer") return;
    supabase
      .from("alerts")
      .select("id", { count: "exact", head: true })
      .eq("read", false)
      .then(({ count }) => setUnread(count ?? 0));
  }, [user, variant]);

  if (loading) return null;

  if (!user) {
    return (
      <Button asChild size="sm" variant="outline">
        <Link to="/auth">
          <LogIn className="mr-2 h-4 w-4" /> Sign in
        </Link>
      </Button>
    );
  }

  const initials = (user.email ?? "?").slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center gap-2">
      {variant === "farmer" && (
        <Button asChild variant="ghost" size="sm" className="relative">
          <Link to="/alerts">
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
                {unread}
              </span>
            )}
          </Link>
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
            {initials}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex flex-col">
            <span className="text-xs text-muted-foreground">Signed in</span>
            <span className="truncate text-sm">{user.email}</span>
            {isAdmin && (
              <Badge variant="outline" className="mt-1 w-fit">
                Admin
              </Badge>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/tickets">
              <TicketCheck className="mr-2 h-4 w-4" /> My tickets
            </Link>
          </DropdownMenuItem>
          {variant === "farmer" && (
            <DropdownMenuItem asChild>
              <Link to="/alerts">
                <Bell className="mr-2 h-4 w-4" /> Notifications
              </Link>
            </DropdownMenuItem>
          )}
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link to="/admin">
                <ShieldCheck className="mr-2 h-4 w-4" /> Admin panel
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
