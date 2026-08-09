import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { Send, Bot, User, Loader2, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export function HelpChat({
  open,
  onOpenChange,
  productId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productId?: string;
}) {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const savedIds = useRef<Set<string>>(new Set());

  const { messages, sendMessage, setMessages, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat", body: { productId } }),
    onError: (err) => toast.error(err.message || "Chat error"),
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load history when opening
  useEffect(() => {
    if (!open || !user || historyLoaded) return;
    supabase
      .from("chat_messages")
      .select("id, role, content, created_at")
      .order("created_at")
      .then(({ data }) => {
        const history: UIMessage[] = (data ?? []).map((m) => {
          savedIds.current.add(m.id);
          return {
            id: m.id,
            role: m.role as "user" | "assistant",
            parts: [{ type: "text", text: m.content }],
          } as UIMessage;
        });
        setMessages(history);
        setHistoryLoaded(true);
      });
  }, [open, user, historyLoaded, setMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  // Persist new messages once complete
  useEffect(() => {
    if (!user || status === "streaming" || status === "submitted") return;
    const toSave = messages
      .filter((m) => !savedIds.current.has(m.id))
      .map((m) => {
        const text = m.parts
          .map((p) => (p.type === "text" ? p.text : ""))
          .join("")
          .trim();
        return { id: m.id, role: m.role, content: text };
      })
      .filter((m) => m.content.length > 0 && (m.role === "user" || m.role === "assistant"));
    if (!toSave.length) return;
    toSave.forEach((m) => savedIds.current.add(m.id));
    supabase
      .from("chat_messages")
      .insert(toSave.map((m) => ({ user_id: user.id, role: m.role, content: m.content })))
      .then(({ error }) => {
        if (error) console.warn("chat save failed", error.message);
      });
  }, [messages, status, user]);

  const isLoading = status === "submitted" || status === "streaming";

  async function clearHistory() {
    if (!user) return;
    if (!confirm("Clear chat history?")) return;
    await supabase.from("chat_messages").delete().eq("user_id", user.id);
    savedIds.current.clear();
    setMessages([]);
    toast.success("History cleared");
  }

  function repeat(text: string) {
    setInput(text);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </span>
              AgroLink Assistant
            </SheetTitle>
            {user && messages.length > 0 && (
              <Button variant="ghost" size="icon" onClick={clearHistory} title="Clear history">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SheetHeader>

        <>
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
            {messages.length === 0 && (
              <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
                Ask about product origin, quality checks, or how to contact a farm. A hotline is
                also available:{" "}
                <span className="font-medium text-foreground">+7 800 555-01-23</span>.
              </div>
            )}
            {messages.map((m, i) => {
              const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
              const isUser = m.role === "user";
              const isLastUser = isUser && i === messages.length - 1;
              return (
                <div key={m.id} className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
                  >
                    {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </div>
                  <div className="max-w-[80%] space-y-1">
                    <div
                      className={`whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      {text}
                    </div>
                    {!isUser && !isLoading && (
                      <button
                        onClick={() => repeat(text.slice(0, 200))}
                        className="text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        Refine this answer
                      </button>
                    )}
                    {isLastUser && !isLoading && (
                      <button
                        onClick={() => sendMessage({ text })}
                        className="text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        Repeat question
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {status === "submitted" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
              </div>
            )}
          </div>

          <form
            className="flex gap-2 border-t bg-card p-3"
            onSubmit={(e) => {
              e.preventDefault();
              const text = input.trim();
              if (!text || isLoading) return;
              sendMessage({ text });
              setInput("");
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Your question…"
              className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </>
      </SheetContent>
    </Sheet>
  );
}
