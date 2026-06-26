import Image from "next/image";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/dos-badge.png"
        alt="Descience Open Source Club"
        width={36}
        height={36}
        className="h-9 w-9 shrink-0"
        priority
      />
      <span className="font-display text-[15px] font-semibold leading-none tracking-tight">
        Descience<span className="text-muted"> / OS</span>
      </span>
    </span>
  );
}
