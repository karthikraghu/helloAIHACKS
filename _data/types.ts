/**
 * Shared TypeScript types for mock data
 */

export interface User {
    id: string;
    name: string;
    email: string;
    role: "admin" | "developer" | "designer" | "viewer";
    avatar: string;
    createdAt: string;
    stats: {
        projects: number;
        contributions: number;
    };
}

export interface Transaction {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    status: "pending" | "completed" | "failed" | "refunded";
    type: "payment" | "refund" | "transfer";
    description: string;
    createdAt: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    status: "active" | "archived" | "draft";
    ownerId: string;
    members: string[];
    createdAt: string;
    updatedAt: string;
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: "info" | "warning" | "error" | "success";
    read: boolean;
    createdAt: string;
}
