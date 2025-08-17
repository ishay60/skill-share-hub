import { prisma } from '../lib/prisma';

export interface CreatePlanData {
  spaceId: string;
  name: string;
  interval: 'month' | 'year';
  price_cents: number;
  stripe_price_id?: string;
}

export class PlanService {
  static async createPlan(data: CreatePlanData) {
    return await prisma.plan.create({
      data,
    });
  }

  static async getPlansBySpace(spaceId: string) {
    return await prisma.plan.findMany({
      where: { spaceId },
      orderBy: { price_cents: 'asc' },
    });
  }

  static async getPlanById(planId: string) {
    return await prisma.plan.findUnique({
      where: { id: planId },
    });
  }

  static async updatePlan(planId: string, data: Partial<CreatePlanData>) {
    return await prisma.plan.update({
      where: { id: planId },
      data,
    });
  }

  static async deletePlan(planId: string) {
    return await prisma.plan.delete({
      where: { id: planId },
    });
  }

  static async createDefaultPlans(spaceId: string) {
    const defaultPlans = [
      {
        spaceId,
        name: 'Monthly',
        interval: 'month' as const,
        price_cents: 999, // $9.99
      },
      {
        spaceId,
        name: 'Yearly',
        interval: 'year' as const,
        price_cents: 9999, // $99.99 (2 months free)
      },
    ];

    const createdPlans = [];
    for (const planData of defaultPlans) {
      const plan = await this.createPlan(planData);
      createdPlans.push(plan);
    }

    return createdPlans;
  }

  static async getPlanWithSpace(planId: string) {
    return await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        space: {
          select: {
            id: true,
            name: true,
            slug: true,
            ownerId: true,
          },
        },
      },
    });
  }
}
