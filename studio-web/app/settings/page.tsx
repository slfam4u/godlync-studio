import { Bell, ShieldCheck, Users } from "lucide-react";
import { StudioShell } from "@/components/studio-shell";

const settings = [
  { title: "Notifications", description: "Manage alerts for uploads, reviews, and publishing updates.", icon: Bell },
  { title: "Team access", description: "Invite leaders, team members, and ministry collaborators.", icon: Users },
  { title: "Security", description: "Review access control, API keys, and permission roles.", icon: ShieldCheck },
];

export default function SettingsPage() {
  return (
    <StudioShell>
      <div className="mt-6 rounded-3xl border border-white/10 bg-[#10141d] p-5 shadow-xl shadow-black/20">
        <div>
          <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Settings</div>
          <h1 className="mt-2 text-3xl font-semibold text-white">Ministry preferences</h1>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {settings.map(({ title, description, icon: Icon }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400/15 to-indigo-500/10 text-sky-200">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-lg font-semibold text-white">{title}</div>
              <p className="mt-2 text-sm text-slate-300">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </StudioShell>
  );
}
