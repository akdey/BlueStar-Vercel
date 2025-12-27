
type LogoProps = {
    className?: string;
    variant?: 'header' | 'hero' | 'footer' | 'icon';
};

export default function Logo({ className = "", variant = 'header' }: LogoProps) {
    const isIconOnly = variant === 'icon';
    const isHero = variant === 'hero';

    return (
        <div className={`flex ${isHero ? 'flex-col' : 'items-center'} gap-4 ${className} select-none`}>
            {/* Logo Icon */}
            {(variant !== 'footer' || isHero) && (
                <div className={`relative ${isHero ? 'w-32 h-32 md:w-40 md:h-40 mx-auto mb-4' : 'w-12 h-12'} flex items-center justify-center shrink-0`}>
                    <svg viewBox="0 0 100 100" className="w-full h-full" style={{ color: "var(--logo-primary)" }}>
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path d="M50 15L61.2 38.3L86.8 42L68.4 60L72.7 85.5L50 73.5L27.3 85.5L31.6 60L13.2 42L38.8 38.3L50 15Z" fill="var(--logo-secondary)" />
                        <rect x="40" y="55" width="40" height="20" fill="currentColor" rx="2" />
                        <circle cx="48" cy="78" r="4" fill="currentColor" />
                        <circle cx="72" cy="78" r="4" fill="currentColor" />
                    </svg>
                    {isHero && (
                        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse" />
                    )}
                </div>
            )}

            {!isIconOnly && (
                <div className={`flex flex-col leading-none transition-colors duration-300 ${isHero ? 'text-center' : ''}`}>
                    <span className={`${isHero ? 'text-6xl md:text-9xl tracking-tighter' : 'text-xl'} font-heading font-black`} style={{ color: "var(--logo-primary)" }}>
                        BLUE STAR
                    </span>
                    <span className={`${isHero ? 'text-xl md:text-3xl tracking-[0.4em] mt-4' : 'text-[10px] tracking-[0.2em]'} font-bold uppercase`} style={{ color: "var(--logo-secondary)" }}>
                        TRADING & Co.
                    </span>
                    {isHero && (
                        <div className="h-1.5 w-32 bg-primary mx-auto rounded-full mt-8 shadow-[0_0_20px_rgba(56,189,248,0.3)] dark:shadow-[0_0_20px_rgba(56,189,248,0.5)]" />
                    )}
                </div>
            )}
        </div>
    );
}
