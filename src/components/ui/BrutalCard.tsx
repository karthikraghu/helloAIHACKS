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

interface BrutalCardProps {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "yellow" | "pink" | "blue" | "green" | "orange" | "purple";
    iconName?: IconName;
    title?: string;
    description?: string;
    onClick?: () => void;
    hoverable?: boolean;
}

const variantStyles = {
    default: "bg-white",
    yellow: "bg-brutal-yellow",
    pink: "bg-brutal-pink",
    blue: "bg-brutal-blue",
    green: "bg-brutal-green",
    orange: "bg-brutal-orange",
    purple: "bg-brutal-purple",
};

export function BrutalCard({
    children,
    className,
    variant = "default",
    iconName,
    title,
    description,
    onClick,
    hoverable = true,
}: BrutalCardProps) {
    const isClickable = !!onClick;
    const Icon = iconName ? getIcon(iconName) : null;

    const baseStyles = cn(
        "border-2 border-black rounded-none p-6",
        "shadow-brutal",
        variantStyles[variant],
        hoverable && "brutal-hover cursor-pointer",
        isClickable && "select-none",
        className
    );

    const content = (
        <>
            {(Icon || title) && (
                <div className="flex items-center gap-3 mb-4">
                    {Icon && (
                        <div className="p-2 bg-black text-white">
                            <Icon className="w-6 h-6" />
                        </div>
                    )}
                    {title && (
                        <h3 className="text-xl font-bold uppercase tracking-tight">
                            {title}
                        </h3>
                    )}
                </div>
            )}
            {description && (
                <p className="text-sm font-medium mb-4 text-black/80">
                    {description}
                </p>
            )}
            {children}
        </>
    );

    if (onClick) {
        return (
            <button onClick={onClick} className={baseStyles}>
                {content}
            </button>
        );
    }

    return <div className={baseStyles}>{content}</div>;
}

// Pre-styled card variants for quick use
export function YellowCard(props: Omit<BrutalCardProps, "variant">) {
    return <BrutalCard {...props} variant="yellow" />;
}

export function PinkCard(props: Omit<BrutalCardProps, "variant">) {
    return <BrutalCard {...props} variant="pink" />;
}

export function BlueCard(props: Omit<BrutalCardProps, "variant">) {
    return <BrutalCard {...props} variant="blue" />;
}

export function GreenCard(props: Omit<BrutalCardProps, "variant">) {
    return <BrutalCard {...props} variant="green" />;
}

// Feature card with icon prominently displayed
export function FeatureCard({
    iconName,
    title,
    description,
    variant = "default",
    className,
}: {
    iconName: IconName;
    title: string;
    description: string;
    variant?: BrutalCardProps["variant"];
    className?: string;
}) {
    const Icon = getIcon(iconName);

    return (
        <BrutalCard variant={variant} className={cn("text-center", className)}>
            <div className="flex justify-center mb-4">
                <div className="p-4 bg-black text-white inline-block">
                    <Icon className="w-8 h-8" />
                </div>
            </div>
            <h3 className="text-lg font-bold uppercase mb-2">{title}</h3>
            <p className="text-sm text-black/70">{description}</p>
        </BrutalCard>
    );
}

// Stat card for dashboards
export function StatCard({
    value,
    label,
    iconName,
    variant = "default",
    trend,
    className,
}: {
    value: string | number;
    label: string;
    iconName?: IconName;
    variant?: BrutalCardProps["variant"];
    trend?: { value: number; isPositive: boolean };
    className?: string;
}) {
    const Icon = iconName ? getIcon(iconName) : null;

    return (
        <BrutalCard variant={variant} className={className}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-3xl font-black">{value}</p>
                    <p className="text-sm font-medium uppercase tracking-wide mt-1">
                        {label}
                    </p>
                    {trend && (
                        <p
                            className={cn(
                                "text-sm font-bold mt-2",
                                trend.isPositive ? "text-green-700" : "text-red-700"
                            )}
                        >
                            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className="p-2 bg-black text-white">
                        <Icon className="w-5 h-5" />
                    </div>
                )}
            </div>
        </BrutalCard>
    );
}
