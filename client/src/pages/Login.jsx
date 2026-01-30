import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Lock, Mail, Loader2, Eye, EyeOff, LayoutDashboard } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, login } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            if (user.role === 'intern') {
                navigate('/portal');
            } else {
                navigate('/dashboard');
            }
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post(
                '/auth/login',
                { email, password }
            );

            if (response.status === 200) {
                const loggedInUser = response.data.user;
                login(loggedInUser);
                if (loggedInUser.role === 'intern') {
                    navigate('/portal');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message ||
                err.response?.data?.error ||
                'Invalid credentials. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans relative overflow-hidden">
            {/* Background Texture/Orbs - Subtle and Light */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-200/20 rounded-full blur-[100px]"></div>
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-emerald-200/20 rounded-full blur-[100px]"></div>
            </div>

            {/* Strong Vignette Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(15,23,42,0.4)_100%)] z-0"></div>

            <Card className="w-full max-w-md shadow-2xl border border-white/50 bg-white/80 backdrop-blur-xl relative z-10">
                <CardHeader className="space-y-1 text-center pb-8 pt-10">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-indigo-50 rounded-2xl shadow-inner border border-indigo-100">
                            <Lock className="w-8 h-8 text-indigo-600" aria-hidden="true" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight text-slate-900">
                        Welcome Back
                    </CardTitle>
                    <CardDescription className="text-slate-500 font-medium">
                        Sign in to access your dashboard
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-5 px-8">
                        {error && (
                            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2" role="alert">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" aria-hidden="true" />
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    aria-label="Email Address"
                                    className="pl-12 h-12 bg-white/50 border-slate-200 focus:bg-white transition-all font-medium text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" aria-hidden="true" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    aria-label="Password"
                                    className="pl-12 pr-12 h-12 bg-white/50 border-slate-200 focus:bg-white transition-all font-medium text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="pb-8 pt-4 px-8">
                        <Button
                            type="submit"
                            className="w-full h-12 text-sm font-bold tracking-wide uppercase transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:scale-[0.98] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default Login;
