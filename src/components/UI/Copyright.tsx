export default function Copyright({ className = "" }: { className?: string }) {
    return (
        <div className={`text-slate-500 text-xs ${className}`}>
            <p>&copy; {new Date().getFullYear()} BLUE STAR Trading & Co. All Rights Reserved.</p>
            <p className="text-xxs mt-1 opacity-80">Developed by Amit Kumar Dey</p>
        </div>
    );
}
