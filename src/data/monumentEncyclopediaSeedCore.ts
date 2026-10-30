import { CORE_MONUMENT_SEEDS_A, type MonumentScholarlySeed } from './monumentEncyclopediaSeedCoreA.ts';
import { CORE_MONUMENT_SEEDS_B } from './monumentEncyclopediaSeedCoreB.ts';

export type { MonumentScholarlySeed };

export const CORE_MONUMENT_SCHOLARLY_SEEDS: Record<string, MonumentScholarlySeed> = {
  ...CORE_MONUMENT_SEEDS_A,
  ...CORE_MONUMENT_SEEDS_B,
};
