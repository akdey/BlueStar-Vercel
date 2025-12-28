import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    MessageSquare,
    Bot,
    User,
    BrainCircuit,
    AlertCircle,
    Sparkles,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import Button from '../../components/UI/Button';
import { useSendChatMessageMutation } from '../../features/api/apiSlice';
import { toast } from 'react-toastify';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

interface ChatHistoryItem {
    role: 'user' | 'assistant';
    content: string;
}

// 1. Move Typewriter Component OUTSIDE to prevent re-mounting on parent state changes
const TypewriterMessage = ({ text, onComplete, onCharTyped }: { text: string; onComplete?: () => void, onCharTyped?: () => void }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
                if (onCharTyped) onCharTyped();
            }, 10);
            return () => clearTimeout(timeout);
        } else if (onComplete) {
            onComplete();
        }
    }, [currentIndex, text, onComplete, onCharTyped]);

    return <span>{displayedText}</span>;
};

// 2. Move Typing Indicator OUTSIDE
const TypingIndicator = () => (
    <div className="flex gap-1.5 px-2 py-2">
        {[0, 1, 2].map((i) => (
            <motion.span
                key={i}
                animate={{
                    y: [0, -7, 0],
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.2, 1]
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                }}
                className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.6)]"
            />
        ))}
    </div>
);

const EnterpriseChat = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const promptsScrollRef = useRef<HTMLDivElement>(null);

    const [sendChatMessage, { isLoading: isTyping }] = useSendChatMessageMutation();

    const samplePrompts = [
        "What were our sales this month?",
        "Show me low stock items",
        "What are our total expenses?",
        "Who are our top customers?",
        "Compare sales vs expenses",
        "Forecast next month's demand",
        "Generate fleet efficiency report",
        "Identify high-risk accounts"
    ];

    const [showLeftScroll, setShowLeftScroll] = useState(false);
    const [showRightScroll, setShowRightScroll] = useState(false);

    // Auto-scroll to bottom of messages
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const checkScrollButtons = () => {
        if (promptsScrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = promptsScrollRef.current;
            setShowLeftScroll(scrollLeft > 5);
            setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 5);
        }
    };

    const scrollPrompts = (direction: 'left' | 'right') => {
        if (promptsScrollRef.current) {
            const scrollAmount = 250;
            promptsScrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleSend = async (text: string = input) => {
        if (!text.trim() || isTyping) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text,
            sender: 'user',
            timestamp: new Date()
        };

        const currentHistory: ChatHistoryItem[] = messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
        }));

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setError(null);

        try {
            const response = await sendChatMessage({
                message: text,
                history: [...currentHistory, { role: 'user', content: text }]
            }).unwrap();

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: response.response,
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err: any) {
            const errorMessage = err.data?.detail || 'Failed to get response.';
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    const { subTotal, totalTax, grandTotal } = { subTotal: 0, totalTax: 0, grandTotal: 0 }; // Placeholder if needed or remove


    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] max-w-5xl mx-auto relative overflow-hidden bg-gray-50/30 dark:bg-slate-950/20 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-2xl">

            {/* 1. Static Header */}
            <header className="shrink-0 p-4 border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-20">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/20">
                        <BrainCircuit size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">
                            Enterprise <span className="text-primary dark:text-blue-400">Chat</span>
                        </h1>
                        {/* <div className="flex items-center gap-1.5 mt-1">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Neural Link Active</p>
                        </div> */}
                    </div>
                </div>
            </header>

            {/* 2. Scrollable Message List */}
            <main
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative mb-6">
                            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                            <div className="relative p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xl">
                                <Bot size={48} className="text-primary mx-auto" />
                            </div>
                        </motion.div>

                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">How can I help you analyze?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-8">Accessing fleet statuses, financial records, and operational metrics.</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                            {samplePrompts.slice(0, 6).map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(prompt)}
                                    className="group p-4 bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-2xl text-left transition-all hover:border-primary/50 hover:shadow-md flex items-center justify-between"
                                >
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors">{prompt}</span>
                                    <ArrowRight size={14} className="text-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-3 max-w-[85%] lg:max-w-[75%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-primary'}`}>
                                        {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                                    </div>
                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-primary text-white rounded-tr-none font-medium' : 'bg-white/80 dark:bg-slate-900/80 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-200 dark:border-slate-800 backdrop-blur-sm'}`}>
                                        {msg.sender === 'ai' && idx === messages.length - 1 ? (
                                            <TypewriterMessage text={msg.text} onCharTyped={scrollToBottom} />
                                        ) : (
                                            msg.text
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start gap-3">
                                <div className="shrink-0 w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-primary">
                                    <Bot size={16} />
                                </div>
                                <div className="bg-white/80 dark:bg-slate-900/80 p-2 md:p-3 rounded-2xl rounded-tl-none border border-gray-200 dark:border-slate-800 shadow-sm flex items-center">
                                    <TypingIndicator />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </main>

            {/* 3. Bottom Input Bar */}
            <footer className="shrink-0 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-slate-800">
                <AnimatePresence>
                    {messages.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative mb-4 px-6">
                            <div
                                ref={promptsScrollRef}
                                onScroll={checkScrollButtons}
                                // The magic classes to hide scrollbar and add mask fade
                                className="flex gap-2 overflow-x-auto scroll-smooth py-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] [mask-image:linear-gradient(to_right,white_90%,transparent)]"
                            >
                                {samplePrompts.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setInput(prompt)}
                                        className="shrink-0 px-4 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full text-[10px] font-bold text-gray-500 dark:text-gray-400 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all whitespace-nowrap shadow-sm"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>

                            {showLeftScroll && (
                                <button onClick={() => scrollPrompts('left')} className="absolute left-0 top-1/2 -translate-y-1/2 p-1.5 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-gray-100 dark:border-slate-700 z-10"><ChevronLeft size={12} /></button>
                            )}
                            {showRightScroll && (
                                <button onClick={() => scrollPrompts('right')} className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-gray-100 dark:border-slate-700 z-10"><ChevronRight size={12} /></button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="relative flex items-center gap-2 bg-white dark:bg-slate-950/50 rounded-2xl border border-gray-200 dark:border-slate-700 p-1.5 shadow-inner focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <div className="hidden sm:flex pl-3 text-gray-400">
                        <MessageSquare size={18} />
                    </div>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your query here..."
                        className="flex-1 bg-transparent border-none outline-none px-2 text-sm text-gray-900 dark:text-white h-10 min-w-0"
                    />
                    <div className="hidden md:flex items-center gap-2 mr-2">
                        <div className="h-4 w-px bg-gray-200 dark:bg-slate-800" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Enter</span>
                    </div>
                    <Button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isTyping}
                        className={`h-10 w-10 !p-0 rounded-xl flex items-center justify-center transition-all ${input.trim() ? 'bg-primary text-white scale-100' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 scale-95'}`}
                    >
                        <Send size={18} />
                    </Button>
                </div>

                {/* <p className="text-[9px] text-center mt-3 text-gray-400 font-medium flex items-center justify-center gap-1 opacity-70">
                    <Sparkles size={10} className="text-primary" /> Powered by BlueStar Neural Model v4.2
                </p> */}
            </footer>

            {/* Floating Error Toast */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold z-50">
                        <AlertCircle size={14} /> {error}
                        <button onClick={() => setError(null)} className="ml-2 hover:scale-110 transition-transform">✕</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EnterpriseChat;