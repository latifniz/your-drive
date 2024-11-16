import { SubscriptionStatus } from "../enums/subscription.enum";

export interface Subscription {
    subscriptionId?: bigint;
    userId: bigint; // Reference to the Users table
    planId: bigint; // Reference to the Plans table
    startDate: Date; // Timestamp when the subscription started
    endDate: Date; // Timestamp when the subscription ends
    status: SubscriptionStatus; // Status of the subscription
    createdAt?: Date; // Timestamp when the subscription was created
    updatedAt?: Date; // Timestamp when the subscription information was last updated
  }
  