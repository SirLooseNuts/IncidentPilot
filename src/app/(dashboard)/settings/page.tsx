import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings — IncidentPilot AI",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Organization, integrations, and billing configuration
        </p>
      </div>

      {/* Organization */}
      <div className="max-w-2xl rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Organization
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Organization Name</label>
            <input
              type="text"
              defaultValue="Acme Corp"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Slug</label>
            <input
              type="text"
              defaultValue="acme-corp"
              disabled
              className="mt-1 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* Plan */}
      <div className="max-w-2xl rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Current Plan
        </h2>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { name: "Free", price: "$0", features: "1 repo · 20 analyses/mo", active: false },
            { name: "Pro", price: "$29/mo", features: "10 repos · Unlimited analyses", active: true },
            { name: "Team", price: "$99/mo", features: "Workspaces · Slack · Analytics", active: false },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg border p-4 text-center transition-colors ${
                plan.active
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-accent"
              }`}
            >
              <p className="text-sm font-bold">{plan.name}</p>
              <p className="mt-1 text-lg font-bold text-primary">{plan.price}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{plan.features}</p>
              {plan.active && (
                <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Current Plan
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Integrations */}
      <div className="max-w-2xl rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Integrations
        </h2>
        <div className="mt-4 space-y-3">
          {[
            { name: "GitHub App", status: "Connected", connected: true },
            { name: "Slack Notifications", status: "Not configured", connected: false },
            { name: "PagerDuty", status: "Not configured", connected: false },
          ].map((integration) => (
            <div
              key={integration.name}
              className="flex items-center justify-between rounded-md border border-border bg-background/50 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{integration.name}</p>
                <p className="text-xs text-muted-foreground">{integration.status}</p>
              </div>
              <button
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  integration.connected
                    ? "border border-agent-success/20 bg-agent-success/10 text-agent-success"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {integration.connected ? "Connected" : "Connect"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* DeepSpec Optimizations */}
      <div className="max-w-2xl rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          DeepSpec Inference Accelerator
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Deploy speculative decoding draft models to accelerate patch and validation token generation speeds.
        </p>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between rounded-md border border-border bg-background/50 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Speculative Decoding Status</p>
              <p className="text-xs text-muted-foreground">Draft models propose tokens parallelized with target verifier.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card-foreground after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Draft Decoding Engine</label>
            <select
              defaultValue="dspark"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="dspark">DSpark (Recommended - optimized for minimal GPU stalls)</option>
              <option value="dflash">DFlash (High throughput parallel validation)</option>
              <option value="eagle3">Eagle3 (Autoregressive sequence proposals)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
