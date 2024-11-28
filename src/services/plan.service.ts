import { BillingCycle } from "../enums/billingCycle.enum";
import { PlanType } from "../enums/planType.enum";
import { PlanModel } from "../models";


export class PlanService {
    
    static async createPlan(name:PlanType, billingCycle:BillingCycle) {
        try {
            const price = 0;
            const storageLimit = 100; // GBs

            const newPlan = await PlanModel.create({
                name: name,
                description: 'Premium plan for users with a large storage limit and faster downloads.',
                storageLimit: BigInt(storageLimit * 1024 * 1024 * 1024), // GBs
                price: price,
                billingCycle: billingCycle
            });
            return newPlan;
        } catch (err) {
            throw new Error(`Error creating plan: ${err}`);
        }
    }

    static async getPlanById(planId: bigint) {
        try {
            return await PlanModel.findByPk(planId);
        } catch (err) {
            throw new Error(`Error finding plan by ID: ${err}`);
        }
    }
    
}