import { BillingCycle } from "../enums/billingCycle.enum";
import { PlanType } from "../enums/planType.enum";

export interface Plan {
    planId?: bigint;
    name: PlanType;  // can be any type 
    description: string;
    storageLimit: bigint; // in bytes
    price: number; // in cents
    billingCycle: BillingCycle
    createdAt?: Date; // Timestamp when the plan was created
    updatedAt?: Date; // Timestamp when the plan information was last updated
  }