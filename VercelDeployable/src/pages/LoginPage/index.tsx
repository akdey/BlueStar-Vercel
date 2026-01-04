import React, { useState, useEffect, useRef } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { Mail, Lock, ArrowRight, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/UI/Logo';
import Button from '../../components/UI/Button';
import Copyright from '../../components/UI/Copyright';
import ChangePasswordModal from '../../components/ChangePasswordModal';

import { useLoginMutation } from '../../features/api/apiSlice';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../features/auth/authSlice';
import { toast } from 'react-toastify';

export default function LoginPage() {
    const [username, setUsername] = useState(''); // Changed from email for spec
    const [password, setPassword] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordChangeUsername, setPasswordChangeUsername] = useState('');
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [login, { isLoading }] = useLoginMutation();

    const pathRef = useRef<SVGPathElement>(null);
    const [pathLength, setPathLength] = useState(0);

    // Progress 0 to 1
    const progress = useMotionValue(0);

    // Road path
    const roadPath = "M 50 150 C 250 50, 100 450, 450 500 C 800 550, 400 850, 650 900 C 900 950, 800 1100, 1200 1100";
    const stops = [0.25, 0.55, 0.85];

    useEffect(() => {
        if (pathRef.current) {
            setPathLength(pathRef.current.getTotalLength());
        }
    }, []);

    useEffect(() => {
        const controls = animate(progress, [0, stops[0], stops[0], stops[1], stops[1], stops[2], stops[2], 1], {
            duration: 20,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.15, 0.25, 0.45, 0.55, 0.75, 0.85, 1],
        });
        return controls.stop;
    }, [pathLength]);

    const truckX = useTransform(progress, (p) => {
        if (!pathRef.current || pathLength === 0) return "5%";
        const pt = pathRef.current.getPointAtLength(p * pathLength);
        return `${(pt.x / 1000) * 100}%`;
    });

    const truckY = useTransform(progress, (p) => {
        if (!pathRef.current || pathLength === 0) return "15%";
        const pt = pathRef.current.getPointAtLength(p * pathLength);
        return `${(pt.y / 1000) * 100}%`;
    });

    const truckRotate = useTransform(progress, (p) => {
        if (!pathRef.current || pathLength === 0) return 0;
        const pt = pathRef.current.getPointAtLength(p * pathLength);
        const nextPt = pathRef.current.getPointAtLength(Math.min(pathLength, p * pathLength + 5));
        return Math.atan2(nextPt.y - pt.y, nextPt.x - pt.x) * (180 / Math.PI);
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Note: API expects Form Data or JSON. Let's assume JSON as per apiSlice.
            // Adjust payload based on your backend. Usually username/password.
            // If your backend uses OAuth2 form-url-encoded, you might need to adjust apiSlice.
            const userData = await login({ username, password }).unwrap();

            // Assume backend returns { access_token, user: { ... } } or similar
            // If it returns only access_token, you might need to decode it or fetch user details separately
            // For now assuming existing structure matches: token property and user details

            // MOCKING response structure if real backend not ready for full auth flow:
            // In a real scenario: verify 'userData' structure.
            // If backend is OAuth2 standard (FastAPI security), it returns `access_token` and `token_type`

            console.log("Login successful, response:", userData); // Debugging

            // Check if password change is required (Handle both flat and nested data structures)
            const isPasswordChangeRequired =
                userData?.password_change_required === true ||
                userData?.data?.password_change_required === true;

            if (isPasswordChangeRequired) {
                const message = userData?.message || userData?.data?.message || 'Password change required';
                const pwUsername = userData?.user?.username || userData?.data?.user?.username || username;

                toast.warning(message);
                setPasswordChangeUsername(pwUsername);
                setShowPasswordModal(true);
                return;
            }

            // The baseQueryWithReauth interceptor should have already extracted the token from headers
            // and dispatched setCredentials if present. We just need to verify and handle any additional
            // user data from the response body if needed.

            // Check if token was provided in the response body (less common but possible)
            const bodyToken = userData.access_token || userData.accessToken || userData.token || userData.data?.token;

            // Extract user data from response body
            const userDetails = userData.user || userData.data?.user || userData;

            // If we have a token in the body (not just headers), dispatch it
            // Otherwise, trust that baseQueryWithReauth already handled it from headers
            if (bodyToken) {
                dispatch(setCredentials({
                    user: userDetails,
                    token: bodyToken
                }));
            } else {
                // Token should be in headers and already dispatched by baseQueryWithReauth
                // Just update user data if we have it and it's different from what was auto-extracted
                const currentToken = sessionStorage.getItem('access_token');
                if (currentToken && userDetails) {
                    dispatch(setCredentials({
                        user: userDetails,
                        token: currentToken
                    }));
                } else if (!currentToken) {
                    // Neither body nor headers had a token - this is an error
                    throw new Error("Login succeeded (200 OK) but no access token found in response body or headers. Check console for details.");
                }
            }

            navigate('/dashboard');
        } catch (err: any) {
            console.error('Failed to login:', err);
            const errorMessage = err?.data?.message || err?.data?.detail || err?.message || 'Login failed';
            toast.error(errorMessage);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col bg-white dark:bg-[#050b18] transition-colors duration-500 select-none font-sans">
            <div className="flex-1 flex flex-col md:flex-row relative">

                {/* LEFT SIDE: Animation and Branding Area - Hidden on Mobile */}
                <div className="hidden md:flex md:w-3/5 lg:w-2/3 relative flex-col items-center justify-center p-8 overflow-hidden bg-slate-50 dark:bg-[#050b18] border-r border-slate-200 dark:border-white/5 transition-colors">
                    {/* Atmospheric Glow */}
                    <div className="absolute inset-0 z-0 opacity-40">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-secondary/10" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(31,122,140,0.1)_0%,transparent_70%)]" />
                    </div>

                    {/* SVG Layer for Path and Node Visualization */}
                    <svg
                        className="absolute inset-0 w-full h-full z-10"
                        viewBox="0 0 1000 1000"
                        preserveAspectRatio="none"
                    >
                        <path
                            ref={pathRef}
                            d={roadPath}
                            stroke="currentColor"
                            className="text-slate-900/10 dark:text-white/10"
                            strokeWidth="3"
                            fill="none"
                            strokeDasharray="10 15"
                        />

                        {/* Stoppage Squares (Nodes) */}
                        {pathLength > 0 && stops.map((stop, i) => {
                            const pt = pathRef.current!.getPointAtLength(stop * pathLength);
                            return (
                                <rect
                                    key={i}
                                    x={pt.x - 12}
                                    y={pt.y - 12}
                                    width="24"
                                    height="24"
                                    className="fill-secondary/20 stroke-accent stroke-[2] opacity-60"
                                    transform={`rotate(45, ${pt.x}, ${pt.y})`}
                                />
                            );
                        })}
                    </svg>

                    {/* The Truck (Brand Icon) */}
                    <motion.div
                        className="absolute z-20 pointer-events-none"
                        style={{
                            left: truckX,
                            top: truckY,
                            rotate: truckRotate,
                            x: "-50%",
                            y: "-50%"
                        }}
                    >
                        <div className="relative text-accent">
                            <Logo variant="icon" className="w-12 h-12 drop-shadow-[0_0_15px_rgba(241,144,32,0.8)]" />
                        </div>
                    </motion.div>

                    {/* Branding Centerpiece */}
                    <div className="relative z-30 text-center pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.2 }}
                            className="mb-8"
                        >
                            <Logo variant="hero" className="scale-75" />
                        </motion.div>
                        <div className="bg-slate-900/10 dark:bg-white/10 h-px w-48 mx-auto opacity-30" />
                        <p className="mt-4 text-[10px] font-bold tracking-[0.5em] text-slate-500 dark:text-white/40 uppercase">Internal Portal Access</p>
                    </div>
                </div>

                {/* RIGHT SIDE: Compact Login Portal */}
                <div className="w-full md:w-2/5 lg:w-1/3 flex flex-col items-center justify-center p-6 min-h-[600px] md:min-h-0 relative bg-white dark:bg-[#050b1a] shadow-2xl md:shadow-[-20px_0_50px_rgba(0,0,0,0.05)] dark:md:shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-40 transition-colors">
                    {/* Logo for mobile */}
                    <div className="md:hidden mb-12">
                        <Logo variant="compact" className="scale-110" />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20, x: 0 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full max-w-[320px] sm:max-w-[280px]"
                    >
                        <div className="backdrop-blur-3xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />

                            <div className="relative z-10">
                                <header className="mb-10 text-center">
                                    <h2 className="text-xl font-heading font-black text-primary dark:text-white mb-1 uppercase tracking-tighter">Portal Login</h2>
                                    <p className="text-slate-400 dark:text-slate-600 text-[9px] font-bold uppercase tracking-[0.2em] leading-none">Internal Access Only</p>
                                </header>

                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="relative group/input">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-700 group-focus-within/input:text-secondary transition-colors" />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Username"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 dark:text-white text-[11px] placeholder:text-slate-400 dark:placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-secondary/40 transition-all font-sans"
                                            />
                                        </div>

                                        <div className="relative group/input">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-700 group-focus-within/input:text-secondary transition-colors" />
                                            <input
                                                type="password"
                                                required
                                                placeholder="Password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 dark:text-white text-[11px] placeholder:text-slate-400 dark:placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-secondary/40 transition-all font-sans"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        disabled={isLoading}
                                        type="submit"
                                        rounded="xl"
                                        className="w-full p-4"
                                    >
                                        {isLoading ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                                            />
                                        ) : (
                                            <>
                                                <span>Connect</span>
                                                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </Button>
                                </form>

                                <footer className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 text-center">
                                    <button
                                        onClick={() => navigate('/')}
                                        className="text-slate-400 dark:text-slate-700 hover:text-primary dark:hover:text-white transition-all text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
                                    >
                                        <span>← Back to Site</span>
                                    </button>
                                </footer>
                            </div>
                        </div>

                        {/* Copyright - Visible but Subtle */}
                        <div className="mt-12 opacity-50 hover:opacity-100 transition-opacity duration-300 px-4">
                            <Copyright className="text-center md:text-left !text-[9px] !text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest whitespace-nowrap" />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Password Change Modal */}
            <ChangePasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                username={passwordChangeUsername}
                isRequired={true}
            />
        </div >
    );
}
