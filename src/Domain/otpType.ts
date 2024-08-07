export interface Otp {
    id: string;
    otp: number;
    userId: string;
    createdAt: Date;
    expiresAt: Date;
}
