import Toggle from "../common/toggle";
import { DefaultStickyBarConfig } from "@/types/config";

// Which devices the bar appears on. Mobile = viewport at or below the Mobile Breakpoint.
export function VisibilityCard({
  config,
  updateConfig,
}: {
  config: DefaultStickyBarConfig;
  updateConfig: (key: string, value: boolean) => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
      <p className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider mb-3">Visibility</p>
      <div className="space-y-3">
        <Toggle
          checked={config.showOnDesktop}
          onChange={(v) => updateConfig("showOnDesktop", v)}
          label="Show on desktop"
        />
        <Toggle
          checked={config.showOnMobile}
          onChange={(v) => updateConfig("showOnMobile", v)}
          label="Show on mobile"
        />
      </div>
    </div>
  );
}
