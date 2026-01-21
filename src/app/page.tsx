"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    BrutalCard,
    BlackButton,
    YellowButton
} from "@/components/ui";
import { simulateMutation } from "@/_data/mockData";
import { Lock, User, Users } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("demo@example.com");
    const [password, setPassword] = useState("password123");

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        // FAKE AUTH (Happy Path)
        await simulateMutation({ email, id: "usr_mock_001" }, 800);

        setLoading(false);
        router.push("/dashboard");
    }

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-brutal-cream">

            {/* LEFT: Branding Section */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-brutal-yellow border-r-4 border-black p-12 relative overflow-hidden">
                {/* Abstract shapes background */}
                <div className="absolute top-10 left-10 w-32 h-32 bg-brutal-pink border-2 border-black shadow-brutal-xl"></div>
                <div className="absolute bottom-20 right-20 w-48 h-48 bg-brutal-blue border-2 border-black rounded-full shadow-brutal-xl"></div>
                <div className="absolute top-1/2 right-10 w-24 h-24 bg-brutal-purple border-2 border-black shadow-brutal-xl transform rotate-12"></div>

                <div className="relative z-10 text-center">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <Users className="w-16 h-16" />
                    </div>
                    <h1 className="text-7xl font-black uppercase mb-4 tracking-tighter bg-white border-4 border-black inline-block px-6 py-2 shadow-brutal-xl">
                        BOARDROOM
                    </h1>
                    <p className="text-2xl font-bold bg-black text-white inline-block px-4 py-2 mt-4">
                        VALIDATE IDEAS WITH EXPERT PERSONAS
                    </p>
                    <p className="text-lg font-bold mt-6 max-w-md">
                        Get feedback from 5 expert perspectives before you build.
                    </p>
                </div>
            </div>

            {/* RIGHT: Login Form */}
            <div className="flex items-center justify-center p-8 lg:p-24 relative">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none"></div>

                <BrutalCard className="w-full max-w-md bg-white relative z-20" variant="default">
                    <div className="mb-8 text-center">
                        <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
                            <Users className="w-8 h-8" />
                            <span className="text-2xl font-black uppercase">Boardroom</span>
                        </div>
                        <h2 className="text-4xl font-black uppercase mb-2">Welcome</h2>
                        <p className="font-bold text-gray-500">Sign in to validate your ideas</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="font-bold uppercase text-sm flex items-center gap-2">
                                <User className="w-4 h-4" /> Email
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 font-bold bg-gray-50 focus:bg-white transition-colors"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="font-bold uppercase text-sm flex items-center gap-2">
                                <Lock className="w-4 h-4" /> Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 font-bold bg-gray-50 focus:bg-white transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        <BlackButton
                            type="submit"
                            fullWidth
                            size="lg"
                            loading={loading}
                            iconName="arrowRight"
                            iconPosition="right"
                            className="mt-4"
                        >
                            Enter Boardroom
                        </BlackButton>
                    </form>

                    <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-300">
                        <p className="text-center font-bold text-sm mb-4 uppercase text-gray-400">Or continue with</p>
                        <div className="grid grid-cols-2 gap-4">
                            <YellowButton className="justify-center" size="sm">
                                Github
                            </YellowButton>
                            <YellowButton className="justify-center" size="sm">
                                Google
                            </YellowButton>
                        </div>
                    </div>
                </BrutalCard>
            </div>
        </div>
    );
}
