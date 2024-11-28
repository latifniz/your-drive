import { SubscriptionStatus } from "../enums/subscription.enum";
import { PlanModel, SubscriptionModel } from "../models";



export class SubscriptionService {

    static async createSubscription(userId:bigint, planId:bigint) {
        try {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1); // Add 1 month to the end date

            const newSubscription = await SubscriptionModel.create({
                userId: userId,
                planId: planId,
                startDate: startDate,
                endDate: endDate,
                status: SubscriptionStatus.ACTIVE
            });
            return newSubscription;
        } catch (err) {
            throw new Error(`Error creating subscription: ${err}`);
        }
    } 
    static async getTotalStorage(userId: bigint) {
        try {
            // Query to get the subscription based on the userId
            const subscription = await SubscriptionModel.findOne({
                where: { userId },  // Filter by userId
                attributes: ['planId'],  // Only select the planId from the subscription
            });
    
            // If no subscription is found, throw an error
            if (!subscription) {
                throw new Error(`No subscription found for userId ${userId}`);
            }
    
            // Now use the planId to get the associated plan and retrieve the storageLimit
            const plan = await PlanModel.findOne({
                where: { planId: subscription.planId },  // Find the plan using the planId
                attributes: ['storageLimit'],  // Only select the storageLimit from the plan
            });
    
            // If no plan is found, throw an error
            if (!plan) {
                throw new Error(`No plan found for planId ${subscription.planId}`);
            }
    
            // Return the storageLimit from the plan
            return plan.storageLimit;
        } catch (err) {
            throw new Error(`Error calculating total storage: ${err}`);
        }
    }
    
    static async getSubscriptionByUserId(userId: bigint) {
        try {
            return await SubscriptionModel.findOne({ where: { userId } });
        } catch (err) {
            throw new Error(`Error finding subscription by userId: ${err}`);
        }
    }
    
}