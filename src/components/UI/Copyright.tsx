export default function Copyright({ className = "" }: { className?: string }) {
    return (
        <div className={`text-slate-500 text-xs ${className}`}>
            <p>&copy; {new Date().getFullYear()} {import.meta.env.VITE_BRAND_NAME || 'BLUE STAR Trading & Co'}. All Rights Reserved.</p>
            <p className="text-xxs mt-1 opacity-80 uppercase tracking-widest font-medium">
                Developed by <a href={import.meta.env.VITE_DEVELOPER_PORTFOLIO_URL || "https://portfolio.akdey.vercel.app/"} target="_blank" rel="noopener noreferrer" className="text-primary dark:text-accent font-black hover:opacity-100 transition-all duration-200 border-b-2 border-primary/20 hover:border-primary/60 pb-0.5">Amit Kumar Dey</a>
            </p>
        </div>
    );
}
