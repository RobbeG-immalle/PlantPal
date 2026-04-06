import { PlantIdentificationResult } from '../types/plant';
import { getSuggestedWateringDays, PLANTNET_API_BASE } from '../utils/constants';

interface PlantNetSuggestion {
  score: number;
  species: {
    scientificNameWithoutAuthor: string;
    commonNames: string[];
  };
}

interface PlantNetResponse {
  results: PlantNetSuggestion[];
  bestMatch?: string;
}

/**
 * Identifies a plant from an image URI using the PlantNet API.
 * Falls back to a mock response if no API key is configured.
 */
export const identifyPlant = async (
  imageUri: string,
): Promise<PlantIdentificationResult> => {
  const apiKey = process.env.EXPO_PUBLIC_PLANTNET_API_KEY;

  if (!apiKey || apiKey === 'your_plantnet_api_key_here') {
    return getMockIdentification();
  }

  try {
    const formData = new FormData();

    // Append image as a file blob
    const fileName = imageUri.split('/').pop() ?? 'plant.jpg';
    formData.append('images', {
      uri: imageUri,
      type: 'image/jpeg',
      name: fileName,
    } as unknown as Blob);

    formData.append('organs', 'leaf');

    const url = `${PLANTNET_API_BASE}/identify/all?api-key=${apiKey}&lang=en&include-related-images=false`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`PlantNet API error: ${response.status}`);
    }

    const data: PlantNetResponse = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error('No plant identified. Try a clearer photo.');
    }

    const top = data.results[0];
    const species = top.species.scientificNameWithoutAuthor;
    const commonName =
      top.species.commonNames?.[0] ?? species;
    const confidence = Math.round(top.score * 100) / 100;

    return {
      species,
      commonName,
      confidence,
      suggestedWateringDays: getSuggestedWateringDays(commonName || species),
    };
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('Failed to identify plant. Please try again.');
  }
};

/** Returns a mock identification result for development/demo use. */
const getMockIdentification = (): PlantIdentificationResult => {
  const mockPlants: PlantIdentificationResult[] = [
    {
      species: 'Monstera deliciosa',
      commonName: 'Swiss Cheese Plant',
      confidence: 0.94,
      suggestedWateringDays: 7,
    },
    {
      species: 'Ficus lyrata',
      commonName: 'Fiddle Leaf Fig',
      confidence: 0.87,
      suggestedWateringDays: 7,
    },
    {
      species: 'Sansevieria trifasciata',
      commonName: 'Snake Plant',
      confidence: 0.91,
      suggestedWateringDays: 14,
    },
    {
      species: 'Spathiphyllum wallisii',
      commonName: 'Peace Lily',
      confidence: 0.88,
      suggestedWateringDays: 5,
    },
    {
      species: 'Pothos aureus',
      commonName: 'Golden Pothos',
      confidence: 0.82,
      suggestedWateringDays: 7,
    },
  ];

  return mockPlants[Math.floor(Math.random() * mockPlants.length)];
};
