import Image from "next/image";

export default function Logo({ className = "h-9 w-auto" }: { className?: string }) {
  return (
    <span className="flex items-center gap-2">
      <Image
        src="/brand/logo-mark.png"
        alt="iDigital"
        width={40}
        height={110}
        priority
        className={`${className} w-auto object-contain`}
      />
      <span className="font-display text-lg font-bold tracking-tight text-ink">
        iDigital
      </span>
    </span>
  );
}
