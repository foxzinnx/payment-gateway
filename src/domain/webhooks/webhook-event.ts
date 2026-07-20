export const WEBHOOK_EVENTS = {
    TRANSACTION_APPROVED: 'transaction.approved',
    TRANSACTION_FAILED: 'transaction.failed',
    TRANSACTION_REFUNDED: 'transaction.refunded',
    DEPOSIT_COMPLETED: 'deposit.completed',
    PAYMENT_LINK_USED: 'payment_link.used'
} as const;

export type WebhookEvent = typeof WEBHOOK_EVENTS[keyof typeof WEBHOOK_EVENTS];

export interface WebhookPayload {
    event: WebhookEvent;
    timestamp: string;
    data: Record<string, unknown>;
}