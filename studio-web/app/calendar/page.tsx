import { CalendarDays } from "lucide-react";
import { StudioShell } from "@/components/studio-shell";

const schedule = [
  { title: "Sunday message", date: "Nov 24 • 9:00 AM", type: "GodLync" },
  { title: "Women’s prayer guide", date: "Nov 25 • 7:30 AM", type: "Instagram" },
  { title: "Youth devotion", date: "Nov 27 • 12:00 PM", type: "YouTube" },
];

export default function CalendarPage() {
  return (
    <StudioShell>
      <div className="mt-6 rounded-3xl border border-white/10 bg-[#10141d] p-5 shadow-xl shadow-black/20">
        <div className="flex items-center gap-2 text-white">
          <CalendarDays className="h-5 w-5 text-amber-300" />
          <h1 className="text-3xl font-semibold">Content calendar</h1>
        </div>

        <div className="mt-6 space-y-4">
          {schedule.map(({ title, date, type }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-white">{title}</div>
                <div className="rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-medium text-amber-200">{type}</div>
              </div>
              <div className="mt-2 text-sm text-slate-300">{date}</div>
            </div>
          ))}
        </div>
      </div>
    </StudioShell>
  );
}
