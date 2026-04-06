import { FeatureAccess, SubscriptionPlan, SubscriptionTier } from '../types/subscription';

/** All available subscription plans. */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    tier: 'free',
    name: 'Seedling',
    price: 'Free',
    priceAmount: 0,
    period: 'none',
    description: 'Get started with the basics',
    features: ['Up to 5 plants', 'Basic reminders', 'Dark mode'],
  },
  {
    id: 'premium_monthly',
    tier: 'premium',
    name: 'Green Thumb',
    price: '€3.49/month',
    priceAmount: 3.49,
    period: 'monthly',
    description: 'Unlock the full plant parent experience',
    features: [
      'Unlimited plants',
      'AI plant recognition',
      'Household sharing',
      'Funny notifications',
      'Escalating reminders',
    ],
    isMostPopular: true,
  },
  {
    id: 'premium_lifetime',
    tier: 'lifetime',
    name: 'Plant Whisperer',
    price: '€24.99',
    priceAmount: 24.99,
    period: 'lifetime',
    description: 'One payment, forever green 🌿',
    features: [
      'Everything in Green Thumb',
      'Lifetime access',
      'Support indie development 💚',
    ],
  },
];

/** Maximum number of plants for free tier users. */
export const FREE_PLANT_LIMIT = 5;

/** Returns the feature access flags for a given subscription tier. */
export const getFeatureAccess = (tier: SubscriptionTier): FeatureAccess => {
  switch (tier) {
    case 'premium':
    case 'lifetime':
      return {
        maxPlants: Infinity,
        aiRecognition: true,
        householdSharing: true,
        funnyNotifications: true,
        escalatingReminders: true,
      };
    case 'free':
    default:
      return {
        maxPlants: FREE_PLANT_LIMIT,
        aiRecognition: false,
        householdSharing: false,
        funnyNotifications: false,
        escalatingReminders: false,
      };
  }
};
