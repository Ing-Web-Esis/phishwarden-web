import { Shield } from "lucide-react";

export const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E5A93C]">
      <Shield className="h-6 w-6 text-[#283F50]" />
    </div>
    <span className="text-xl font-bold text-white tracking-wide">PhishWarden</span>
  </div>
);