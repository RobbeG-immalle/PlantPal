import { Plant } from './plant';

/** Root stack param list – used by AppNavigator. */
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

/** Auth stack param list. */
export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
};

/** Main bottom tab param list. */
export type MainTabParamList = {
  Home: undefined;
  AddPlant: undefined;
  Household: undefined;
  Settings: undefined;
};

/** Home stack (nested inside Home tab). */
export type HomeStackParamList = {
  PlantList: undefined;
  PlantDetail: { plantId: string };
};

/** Household stack (nested inside Household tab). */
export type HouseholdStackParamList = {
  HouseholdMain: undefined;
  JoinHousehold: undefined;
};
