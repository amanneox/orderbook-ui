import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { 
    Zap, Shield, Lock, User, ArrowRight, 
    Terminal, Radio, Activity, Globe 
} from "lucide-react";

// Animated background particles
const BackgroundGrid = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid Pattern */}
        <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
                backgroundImage: `
                    linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                    linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
            }}
        />
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 text-primary/20 animate-pulse">
            <Activity size={24} />
        </div>
        <div className="absolute top-40 right-32 text-primary/15 animate-pulse" style={{ animationDelay: '0.5s' }}>
            <Radio size={20} />
        </div>
        <div className="absolute bottom-32 left-40 text-primary/10 animate-pulse" style={{ animationDelay: '1s' }}>
            <Globe size={28} />
        </div>
    </div>
);

// Logo Component
const Logo = () => (
    <div className="flex items-center gap-3 mb-2">
        <div className="relative">
            <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-primary to-primary-700 rounded-sm shadow-xl shadow-primary/20">
                <Zap size={24} className="text-primary-foreground" fill="currentColor" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-card status-online" />
        </div>
        <div>
            <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
                NEXUS<span className="text-primary">HFT</span>
            </h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">High-Frequency Trading</p>
        </div>
    </div>
);

// Feature Badge
const FeatureBadge = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon size={12} className="text-primary" />
        <span>{text}</span>
    </div>
);

// Input Field Component
const InputField = ({
    id,
    label,
    type = "text",
    value,
    onChange,
    icon: Icon,
    placeholder,
    onKeyDown
}: {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    icon: React.ElementType;
    placeholder: string;
    onKeyDown?: (e: React.KeyboardEvent) => void;
}) => (
    <div className="space-y-2">
        <label 
            htmlFor={id}
            className="block text-xs font-medium text-muted-foreground uppercase tracking-wider"
        >
            {label}
        </label>
        <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors duration-200">
                <Icon size={16} />
            </div>
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                className="w-full bg-secondary/50 border border-border rounded-sm pl-10 pr-4 py-3 
                    text-sm text-foreground placeholder:text-muted-foreground/30
                    focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20
                    transition-all duration-200"
                autoComplete="off"
            />
            <div className="absolute inset-0 rounded-sm bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-200" />
        </div>
    </div>
);

// Mode Toggle
const ModeToggle = ({
    mode,
    setMode
}: {
    mode: "login" | "register";
    setMode: (mode: "login" | "register") => void;
}) => (
    <div className="flex p-1 bg-secondary/50 rounded-sm border border-border/50">
        {(['login', 'register'] as const).map((m) => (
            <button
                key={m}
                onClick={() => setMode(m)}
                className={`
                    flex-1 py-2 px-4 text-xs font-semibold uppercase tracking-wider rounded-sm
                    transition-all duration-200
                    ${mode === m 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                        : 'text-muted-foreground hover:text-foreground'
                    }
                `}
            >
                {m}
            </button>
        ))}
    </div>
);

// Submit Button
const SubmitButton = ({ 
    mode, 
    onClick, 
    loading 
}: { 
    mode: "login" | "register"; 
    onClick: () => void;
    loading?: boolean;
}) => (
    <button
        onClick={onClick}
        disabled={loading}
        className="
            w-full relative overflow-hidden group
            bg-primary text-primary-foreground
            py-4 px-6 rounded-sm
            font-display font-semibold text-sm uppercase tracking-widest
            shadow-lg shadow-primary/20
            hover:shadow-xl hover:shadow-primary/30
            active:scale-[0.98]
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
        "
    >
        {/* Shimmer Effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <span className="relative flex items-center justify-center gap-2">
            {loading ? (
                <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Processing...</span>
                </>
            ) : (
                <>
                    <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                </>
            )}
        </span>
    </button>
);

// Security Badge
const SecurityBadge = () => (
    <div className="flex items-center justify-center gap-2 text-2xs text-muted-foreground/60 mt-4">
        <Lock size={10} />
        <span>256-bit Encryption • Secure Connection</span>
    </div>
);

// ============================================
// MAIN LOGIN PAGE
// ============================================

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [mode, setMode] = useState<"login" | "register">("login");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleAuth = async () => {
        if (!username || !password) {
            toast({ 
                title: "Validation Error", 
                description: "Please enter both username and password",
                variant: "destructive" 
            });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/${mode}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                }
            );

            const data = await res.json();

            if (res.ok) {
                login(data.token, data.user);
                toast({ 
                    title: "Welcome", 
                    description: `Successfully ${mode === 'login' ? 'signed in' : 'registered'}` 
                });
                navigate("/");
            } else {
                toast({ 
                    title: "Authentication Failed", 
                    description: data.error || "Invalid credentials", 
                    variant: "destructive" 
                });
            }
        } catch (e) {
            toast({ 
                title: "Connection Error", 
                description: "Unable to connect to server", 
                variant: "destructive" 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
            <BackgroundGrid />

            <div className="w-full max-w-md z-10">
                {/* Main Card */}
                <div className="terminal-window rounded-sm">
                    {/* Window Header */}
                    <div className="window-header">
                        <div className="flex items-center gap-2">
                            <Terminal size={14} className="text-primary/70" />
                            <span className="text-2xs text-muted-foreground uppercase tracking-wider">
                                HFT_TERMINAL_v2.0
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-primary/30" />
                            <div className="w-2 h-2 rounded-full bg-primary/20" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">
                        {/* Logo */}
                        <div className="text-center space-y-1">
                            <Logo />
                        </div>

                        {/* Mode Toggle */}
                        <ModeToggle mode={mode} setMode={setMode} />

                        {/* Form */}
                        <div className="space-y-4">
                            <InputField
                                id="username"
                                label="Username"
                                value={username}
                                onChange={setUsername}
                                icon={User}
                                placeholder="Enter your username"
                                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                            />
                            <InputField
                                id="password"
                                label="Password"
                                type="password"
                                value={password}
                                onChange={setPassword}
                                icon={Lock}
                                placeholder="Enter your password"
                                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                            />
                        </div>

                        {/* Submit */}
                        <SubmitButton 
                            mode={mode} 
                            onClick={handleAuth}
                            loading={loading}
                        />

                        {/* Security */}
                        <SecurityBadge />
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-between text-2xs text-muted-foreground/50">
                    <div className="flex items-center gap-4">
                        <FeatureBadge icon={Shield} text="Military Grade" />
                        <FeatureBadge icon={Radio} text="Real-time" />
                    </div>
                    <span>v2.0.1</span>
                </div>
            </div>

            {/* CRT Effects */}
            <div className="scanlines" />
            <div className="crt-overlay" />
        </div>
    );
}
