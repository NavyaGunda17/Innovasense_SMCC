// src/selectors/campaignSelectors.ts

import { RootState } from "../store/store";


// Fields that should be filled for "Generate" button to appear
const requiredFields: (keyof RootState["campaign"])[] = [
  "campaignDuration",
  "startDate",
];

export const selectIsGenerateEnabled = (state: RootState): boolean => {
  const campaign = state.campaign;
  const initial = campaign.initialCampaignValues || {};

  return requiredFields.some((field) => {
    const current = campaign[field];
    const original = initial[field];

    // If array, compare length and values
    if (Array.isArray(current) && Array.isArray(original)) {
      if (current.length !== original.length) return true;
      return current.some((val, i) => val !== original[i]);
    }

    return current !== original;
  });
};