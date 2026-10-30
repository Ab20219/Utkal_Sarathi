import {
  CORE_MONUMENT_SCHOLARLY_SEEDS,
  type MonumentScholarlySeed,
} from './monumentEncyclopediaSeedCore.ts';
import { ADDITIONAL_MONUMENT_SCHOLARLY_SEEDS } from './monumentEncyclopediaSeedAdditional.ts';

export type { MonumentScholarlySeed };

export const MONUMENT_SCHOLARLY_SEEDS: Record<string, MonumentScholarlySeed> = {
  ...CORE_MONUMENT_SCHOLARLY_SEEDS,
  ...ADDITIONAL_MONUMENT_SCHOLARLY_SEEDS,
};
