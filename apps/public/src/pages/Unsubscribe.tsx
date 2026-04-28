import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, MailX, AlertCircle, Check } from "lucide-react";
import { Button } from "@hci/shared/ui/button";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";

type State =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "done" }
  | { kind: "resubscribed" }
  | { kind: "error"; message: string };

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const sid = (params.get("sid") || "").trim();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!sid) {
      setState({ kind: "missing" });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sid, action: "unsubscribe" }),
        });
        if (cancelled) return;
        if (res.ok) {
          setState({ kind: "done" });
        } else {
          const data = await res.json().catch(() => ({}));
          setState({
            kind: "error",
            message: data.error || "We couldn't process that request.",
          });
        }
      } catch {
        if (!cancelled) setState({ kind: "error", message: "Network error." });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sid]);

  async function handleResubscribe() {
    setBusy(true);
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sid, action: "resubscribe" }),
      });
      setState(res.ok ? { kind: "resubscribed" } : { kind: "error", message: "Could not resubscribe." });
    } catch {
      setState({ kind: "error", message: "Could not resubscribe." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Layout>
      <SEO
        title="Unsubscribe"
        description="Unsubscribe from HCI Medical Group emails."
        noIndex
      />
      <section className="py-16 md:py-24 bg-muted/20">
        <div className="container max-w-xl">
          <div className="bg-card border border-border rounded-xl p-8">
            {state.kind === "loading" && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing your request&hellip;
              </div>
            )}

            {state.kind === "missing" && (
              <>
                <h1 className="font-display text-2xl font-semibold mb-2">
                  Missing subscriber link
                </h1>
                <p className="text-muted-foreground">
                  Please use the unsubscribe link from one of our emails. If you can't
                  find it,{" "}
                  <Link to="/contact" className="text-secondary underline">
                    contact us
                  </Link>{" "}
                  and we'll take care of it.
                </p>
              </>
            )}

            {state.kind === "done" && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <MailX className="h-7 w-7 text-secondary" />
                  <h1 className="font-display text-2xl font-semibold">
                    You've been unsubscribed.
                  </h1>
                </div>
                <p className="text-muted-foreground mb-6">
                  We won't send you any more emails. We're sorry to see you go &mdash;
                  if you change your mind, you can resubscribe below.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleResubscribe}
                    disabled={busy}
                    variant="outline"
                  >
                    {busy ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Working&hellip;
                      </>
                    ) : (
                      "Resubscribe"
                    )}
                  </Button>
                  <Button asChild className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    <Link to={`/preferences?sid=${encodeURIComponent(sid)}`}>
                      Manage preferences instead
                    </Link>
                  </Button>
                </div>
              </>
            )}

            {state.kind === "resubscribed" && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <Check className="h-7 w-7 text-secondary" />
                  <h1 className="font-display text-2xl font-semibold">
                    Welcome back!
                  </h1>
                </div>
                <p className="text-muted-foreground mb-4">
                  You're resubscribed and will start receiving our emails again.
                </p>
                <Button asChild variant="outline">
                  <Link to={`/preferences?sid=${encodeURIComponent(sid)}`}>
                    Manage preferences
                  </Link>
                </Button>
              </>
            )}

            {state.kind === "error" && (
              <>
                <div className="flex items-start gap-3 text-destructive mb-3">
                  <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
                  <h1 className="font-display text-2xl font-semibold">
                    {state.message}
                  </h1>
                </div>
                <p className="text-muted-foreground">
                  Try the link from your most recent email, or{" "}
                  <Link to="/contact" className="text-secondary underline">
                    contact us
                  </Link>{" "}
                  for help.
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
