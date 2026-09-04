import Image from "next/image";

const SIZES = {
  sm: { box: "h-8 w-8", logo: 16, border: "border-2" },
  md: { box: "h-12 w-12", logo: 24, border: "border-[3px]" },
  lg: { box: "h-16 w-16", logo: 32, border: "border-4" },
} as const;

export function Spinner({
  size = "md",
  className = "",
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const { box, logo, border } = SIZES[size];

  return (
    <div className={`relative ${box} ${className}`} role="status" aria-label="Cargando">
      <div className={`absolute inset-0 rounded-full ${border} border-brand-600/20 border-t-brand-600 animate-spin`} />
      <div className="absolute inset-0 flex items-center justify-center">
        <Image src="/logo.png" alt="" width={logo} height={logo} className="rounded-full object-contain" />
      </div>
    </div>
  );
}

export function SpinnerOverlay({ label }: { label?: string }) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 py-10">
      <Spinner size="md" />
      {label && <p className="text-sm text-slate-custom-700">{label}</p>}
    </div>
  );
}
