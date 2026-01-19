"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
    Star,
    Zap,
    Rocket,
    Users,
    TrendingUp,
    ArrowRight,
    Heart,
    Settings,
    Mail,
    Bell,
    Check,
    X,
    type LucideIcon,
} from "lucide-react";

// Icon registry for string-based icon lookup (Server Component safe)
const iconRegistry: Record<string, LucideIcon> = {
    star: Star,
    zap: Zap,
    rocket: Rocket,
    users: Users,
    trendingUp: TrendingUp,
    arrowRight: ArrowRight,
    heart: Heart,
    settings: Settings,
    mail: Mail,
    bell: Bell,
    check: Check,
    x: X,
};

export type IconName = keyof typeof iconRegistry;

export function getIcon(name: IconName): LucideIcon {
    return iconRegistry[name] || Star;
}

interface BrutalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: "default" | "yellow" | "pink" | "blue" | "green" | "orange" | "purple" | "black" | "white";
    size?: "sm" | "md" | "lg";
    iconName?: IconName;
    iconPosition?: "left" | "right";
    fullWidth?: boolean;
    loading?: boolean;
}

const variantStyles = {
    default: "bg-white text-black hover:bg-gray-100",
    yellow: "bg-brutal-yellow text-black hover:bg-yellow-300",
    pink: "bg-brutal-pink text-black hover:bg-pink-400",
    blue: "bg-brutal-blue text-black hover:bg-cyan-300",
    green: "bg-brutal-green text-black hover:bg-green-300",
    orange: "bg-brutal-orange text-black hover:bg-orange-400",
    purple: "bg-brutal-purple text-black hover:bg-purple-300",
    black: "bg-black text-white hover:bg-gray-800",
    white: "bg-white text-black hover:bg-gray-100",
};

const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-7 py-3.5 text-lg",
};

export function BrutalButton({
    children,
    className,
    variant = "default",
    size = "md",
    iconName,
    iconPosition = "left",
    fullWidth = false,
    loading = false,
    disabled,
    ...props
}: BrutalButtonProps) {
    const Icon = iconName ? getIcon(iconName) : null;

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center gap-2",
                "font-bold uppercase tracking-wide",
                "border-2 border-black rounded-none",
                "shadow-brutal",
                "transition-all duration-100 ease-in-out",
                "hover:shadow-brutal-lg hover:-translate-x-0.5 hover:-translate-y-0.5",
                "active:shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-brutal",
                variantStyles[variant],
                sizeStyles[size],
                fullWidth && "w-full",
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="animate-spin">⏳</span>
            ) : (
                <>
                    {Icon && iconPosition === "left" && <Icon className="w-5 h-5" />}
                    {children}
                    {Icon && iconPosition === "right" && <Icon className="w-5 h-5" />}
                </>
            )}
        </button>
    );
}

// Pre-styled button shortcuts
export function YellowButton(props: Omit<BrutalButtonProps, "variant">) {
    return <BrutalButton {...props} variant="yellow" />;
}

export function PinkButton(props: Omit<BrutalButtonProps, "variant">) {
    return <BrutalButton {...props} variant="pink" />;
}

export function BlueButton(props: Omit<BrutalButtonProps, "variant">) {
    return <BrutalButton {...props} variant="blue" />;
}

export function BlackButton(props: Omit<BrutalButtonProps, "variant">) {
    return <BrutalButton {...props} variant="black" />;
}
