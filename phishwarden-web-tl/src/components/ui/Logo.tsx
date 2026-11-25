import Link from "next/link";
import { Shield } from "lucide-react";

interface LogoProps {
  href?: string;
  className?: string;
  textColor?: string;
}

export const Logo = ({
  href = "/",
  className = "",
  textColor = "text-white",
}: LogoProps) => {
  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5A93C] shadow-sm transition-transform group-hover:scale-105">
        <Shield className="h-6 w-6 text-[#283F50]" />
      </div>
      <span className={`text-xl font-bold tracking-tight transition-opacity group-hover:opacity-90 ${textColor}`}>
        PhishWarden
      </span>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center group cursor-pointer"
        title="Volver a la página principal"
      >
        {content}
      </Link>
    );
  }

  return content;
};
