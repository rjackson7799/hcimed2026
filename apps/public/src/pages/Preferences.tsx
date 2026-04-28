import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Loader2, Check, AlertCircle, MailX } from "lucide-react";
import { Button } from "@hci/shared/ui/button";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { cn } from "@hci/shared/lib/utils";
import {
  TOPIC_KEYS,
  TOPIC_LABELS,
  PATIENT_STATUS_VALUES,
  PATIENT_STATUS_LABELS,
  type PreferencesView,
  type TopicKey,
  type PatientStatusValue,
} from "@/lib/schemas/preferencesSchema";

type LoadState =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "error"; message: string }
  | { kind: "ready"; view: PreferencesView };

export default function Preferences() {
  const [params] = useSearchParams();
  const sid = (params.get("sid") || "").trim();

  const [load, setLoad] = useState<LoadState>({ kind: "loading" });
  const [topics, setTopics] = useState<Record<TopicKey, boolean>>(() =>
    Object.fromEntries(TOPIC_KEYS.map((k) => [k, true])) as Record<TopicKey, boolean>,
  );
  const [patientStatus, setPatientStatus] = useState<PatientStatusValue | "">("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [unsubState, setUnsubState] = useState<"idle" | "working" | "done" | "error">("idle");

  useEffect(() => {
    let cancelled = false;
    if (!sid) {
      setLoad({ kind: "missing" });
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/preferences-get?sid=${encodeURIComponent(sid)}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setLoad({ kind: "error", message: data.error || "Could not load preferences." });
          return;
        }
        const view = data as PreferencesView;
        setTopics(view.topics);
        setPatientStatus(view.patientStatus ?? "");
        setLoad({ kind: "ready", view });
      } catch {
        if (!cancelled) setLoad({ kind: "error", message: "Could not load preferences." });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sid]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveState("saving");
    try {
      const res = await fetch("/api/preferences-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sid,
          topics,
          patientStatus: patientStatus || undefined,
        }),
      });
      if (!res.ok) {
        setSaveState("error");
        return;
      }
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  async function handleUnsubscribe() {
    setUnsubState("working");
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sid, action: "unsubscribe" }),
      });
      setUnsubState(res.ok ? "done" : "error");
    } catch {
      setUnsubState("error");
    }
  }

  return (
    <Layout>
      <SEO
        title="Email Preferences"
        description="Manage your email subscription preferences with HCI Medical Group."
        noIndex
      />
      <section className="py-16 md:py-24 bg-muted/20">
        <div className="container max-w-2xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Email Preferences
          </h1>
          <p className="text-muted-foreground mb-8">
            Choose what you'd like to hear from HCI Medical Group about.
          </p>

          {load.kind === "loading" && (
            <div className="bg-card border border-border rounded-xl p-8 flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading your preferences&hellip;
            </div>
          )}

          {load.kind === "missing" && (
            <div className="bg-card border border-border rounded-xl p-8 text-foreground">
              <p className="mb-2 font-semibold">We can't find your subscription.</p>
              <p className="text-sm text-muted-foreground">
                Please use the &ldquo;Manage preferences&rdquo; link in any email we've
                sent you. If you're trying to unsubscribe, you can also{" "}
                <Link to="/contact" className="text-secondary underline">
                  contact us directly
                </Link>
                .
              </p>
            </div>
          )}

          {load.kind === "error" && (
            <div className="bg-destructive/5 border border-destructive/30 rounded-xl p-6 text-destructive flex items-start gap-3">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">{load.message}</p>
                <p className="text-sm">
                  Try the link from your most recent email, or{" "}
                  <Link to="/contact" className="underline">
                    contact us
                  </Link>{" "}
                  for help.
                </p>
              </div>
            </div>
          )}

          {load.kind === "ready" && unsubState === "done" && (
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="flex items-center gap-3 mb-3">
                <MailX className="h-6 w-6 text-secondary" />
                <h2 className="font-display text-xl font-semibold">
                  You've been unsubscribed.
                </h2>
              </div>
              <p className="text-muted-foreground mb-4">
                We won't send you any more emails. We're sorry to see you go.
              </p>
              <Button
                onClick={async () => {
                  setUnsubState("working");
                  const res = await fetch("/api/unsubscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sid, action: "resubscribe" }),
                  });
                  setUnsubState(res.ok ? "idle" : "error");
                }}
                variant="outline"
              >
                Resubscribe
              </Button>
            </div>
          )}

          {load.kind === "ready" && unsubState !== "done" && (
            <form
              onSubmit={handleSave}
              className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Subscriber
                </p>
                <p className="text-foreground">{load.view.email}</p>
                {load.view.status !== "active" && (
                  <p className="text-sm text-amber-600 mt-1">
                    Status: {load.view.status}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  What would you like to receive?
                </p>
                <div className="space-y-2">
                  {TOPIC_KEYS.map((key) => {
                    const checked = topics[key];
                    return (
                      <label
                        key={key}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-md border-2 cursor-pointer transition-all",
                          checked
                            ? "border-secondary bg-secondary/5"
                            : "border-border bg-card hover:border-secondary/50",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0",
                            checked
                              ? "bg-secondary border-secondary"
                              : "bg-card border-border",
                          )}
                        >
                          {checked && (
                            <Check className="h-3.5 w-3.5 text-secondary-foreground" />
                          )}
                        </span>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          onChange={(e) =>
                            setTopics((prev) => ({ ...prev, [key]: e.target.checked }))
                          }
                        />
                        <span className="text-sm text-foreground leading-snug">
                          {TOPIC_LABELS[key]}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Your relationship to HCI
                </p>
                <div className="space-y-2">
                  {PATIENT_STATUS_VALUES.map((value) => {
                    const selected = patientStatus === value;
                    return (
                      <label
                        key={value}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-md border-2 cursor-pointer transition-all",
                          selected
                            ? "border-secondary bg-secondary/5"
                            : "border-border bg-card hover:border-secondary/50",
                        )}
                      >
                        <input
                          type="radio"
                          name="patientStatus"
                          className="sr-only"
                          checked={selected}
                          onChange={() => setPatientStatus(value)}
                        />
                        <span
                          className={cn(
                            "h-4 w-4 rounded-full border-2 flex-shrink-0",
                            selected
                              ? "border-secondary bg-secondary"
                              : "border-border bg-card",
                          )}
                        />
                        <span className="text-sm text-foreground">
                          {PATIENT_STATUS_LABELS[value]}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={saveState === "saving"}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                >
                  {saveState === "saving" ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving&hellip;
                    </>
                  ) : (
                    "Save Preferences"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUnsubscribe}
                  disabled={unsubState === "working"}
                >
                  {unsubState === "working" ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Working&hellip;
                    </>
                  ) : (
                    "Unsubscribe from all emails"
                  )}
                </Button>
              </div>

              {saveState === "saved" && (
                <p className="text-sm text-secondary flex items-center gap-1">
                  <Check className="h-4 w-4" /> Preferences saved.
                </p>
              )}
              {saveState === "error" && (
                <p className="text-sm text-destructive">
                  We couldn't save those changes. Please try again.
                </p>
              )}
              {unsubState === "error" && (
                <p className="text-sm text-destructive">
                  Something went wrong. Please try again or{" "}
                  <Link to="/contact" className="underline">
                    contact us
                  </Link>
                  .
                </p>
              )}
            </form>
          )}
        </div>
      </section>
    </Layout>
  );
}
