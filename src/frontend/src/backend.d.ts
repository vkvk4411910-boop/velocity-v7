import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface Order {
    id: bigint;
    status: OrderStatus;
    createdAt: Time;
    totalCents: bigint;
    user: Principal;
    items: Array<CartItem>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface CartItem {
    productId: bigint;
    quantity: bigint;
}
export interface Product {
    id: bigint;
    name: string;
    description: string;
    stock: bigint;
    imageUrl: string;
    category: string;
    priceCents: bigint;
}
export interface UserProfile {
    name: string;
}
export enum OrderStatus {
    shipped = "shipped",
    pending = "pending",
    paid = "paid",
    delivered = "delivered"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCart(): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createProduct(product: Product): Promise<bigint>;
    deleteProduct(productId: bigint): Promise<void>;
    filterProductsByCategory(category: string): Promise<Array<Product>>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getOrder(orderId: bigint): Promise<Order | null>;
    getOrders(): Promise<Array<Order>>;
    getProduct(productId: bigint): Promise<Product | null>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    listProducts(): Promise<Array<Product>>;
    placeOrder(): Promise<bigint>;
    removeFromCart(productId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
    updateProduct(product: Product): Promise<void>;
}
