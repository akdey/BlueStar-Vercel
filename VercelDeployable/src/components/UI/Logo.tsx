
type LogoProps = {
    className?: string;
    variant?: 'header' | 'hero' | 'footer' | 'icon' | 'compact';
};

export default function Logo({ className = "", variant = 'header' }: LogoProps) {
    const isIconOnly = variant === 'icon';
    const isHero = variant === 'hero';

    return (
        <div className={`flex ${isHero ? 'flex-col' : 'items-center'} gap-4 ${className} select-none`}>
            {/* Logo Icon */}
            {(variant !== 'footer' || isHero) && (
                <div className={`relative ${isHero ? 'w-32 h-32 md:w-40 md:h-40 mx-auto mb-4' : 'w-12 h-12'} flex items-center justify-center shrink-0`}>
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <path fill="var(--logo-primary)" d="M50 25.5c-11.8 0-21.7 8.3-24.1 19.3-.3 1.4-.4 2.8-.4 4.3 0 1.5.1 3 .4 4.4.4 1.8 1 3.5 1.8 5.1l1.4-.7c-.7-1.4-1.2-3-1.6-4.6-.2-1.3-.3-2.7-.3-4.1 0-1.4.1-2.7.4-4 2.2-10 11.2-17.6 22-17.6 10.7 0 19.8 7.4 22 17.3.3 1.3.4 2.7.4 4.1s-.1 2.8-.4 4.1c-1.1 4.9-3.7 9.1-7.2 12.3l1.1 1c3.8-3.5 6.6-8.1 7.8-13.4.3-1.4.5-2.9.5-4.4s-.2-3-.5-4.4c-2.4-11.1-12.3-19.4-24.3-19.4z" />
                        <polygon fill="var(--logo-secondary)" points="50 32.5 53.8 40.2 62.3 41.5 56.1 47.5 57.6 56 50 52 42.4 56 43.9 47.5 37.7 41.5 46.2 40.2" />
                        <path fill="var(--logo-primary)" d="M38 52h18v9H38z" />
                        <path fill="var(--logo-primary)" d="M56 53.5l6.5 0 2.5 3.5 0 4-13 0z" />
                        <circle fill="var(--logo-primary)" cx="41.5" cy="62.5" r="2.2" />
                        <circle fill="var(--logo-primary)" cx="46.5" cy="62.5" r="2.2" />
                        <circle fill="var(--logo-primary)" cx="61.5" cy="62.5" r="2.2" />
                    </svg>
                    {isHero && (
                        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse" />
                    )}
                </div>
            )}

            {!isIconOnly && (
                <div className={`flex flex-col leading-none transition-colors duration-300 ${isHero ? 'text-center' : ''}`}>
                    <span className={`${isHero ? 'text-6xl md:text-9xl tracking-tighter' : variant === 'compact' ? 'text-lg' : 'text-xl'} font-heading font-black`} style={{ color: "var(--logo-primary)" }}>
                        {(import.meta.env.VITE_BRAND_NAME || 'BLUE STAR').split(' ').slice(0, 2).join(' ')}
                    </span>
                    {variant !== 'compact' && (
                        <span className={`${isHero ? 'text-xl md:text-3xl tracking-[0.4em] mt-4' : 'text-[10px] tracking-[0.2em]'} font-bold uppercase`} style={{ color: "var(--logo-secondary)" }}>
                            {(import.meta.env.VITE_BRAND_NAME || 'Trading & Co.').split(' ').slice(2).join(' ') || 'Trading & Co.'}
                        </span>
                    )}
                    {isHero && (
                        <div className="h-1.5 w-32 bg-primary mx-auto rounded-full mt-8 shadow-[0_0_20px_rgba(56,189,248,0.3)] dark:shadow-[0_0_20px_rgba(56,189,248,0.5)]" />
                    )}
                </div>
            )}
        </div>
    );
}
