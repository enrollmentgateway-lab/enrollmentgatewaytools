import Image from "next/image";

type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export function BrandHeader({ eyebrow, title, subtitle, actions }: Props) {
  return (
    <header className="bg-brand-black text-brand-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <Image
              src="/brand/logo-horizontal-white.png"
              alt="Gateway Seminary"
              width={260}
              height={48}
              className="h-9 w-auto"
              priority
            />
            <p className="eyebrow mt-6 text-brand-gold">{eyebrow}</p>
            <h1 className="rule-gold mt-3 font-heading text-4xl leading-tight">{title}</h1>
            {subtitle ? (
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-brand-white/70">
                {subtitle}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      </div>
    </header>
  );
}
