import type { ExerciseCategory, ExerciseCategoryValue } from "@/types/exercise";

export const EXERCISE_CATEGORIES: readonly ExerciseCategory[] = [
  { value: "chest", label: "胸", color: "oklch(0.62 0.2 25)" },
  { value: "back", label: "背中", color: "oklch(0.55 0.16 250)" },
  { value: "shoulder", label: "肩", color: "oklch(0.72 0.16 65)" },
  { value: "arm", label: "腕", color: "oklch(0.58 0.19 300)" },
  { value: "leg", label: "脚", color: "oklch(0.6 0.16 150)" },
  { value: "cardio", label: "有酸素", color: "oklch(0.65 0.15 195)" },
  { value: "other", label: "その他", color: "oklch(0.6 0.02 260)" },
] as const;

const CATEGORY_BY_VALUE = new Map(
  EXERCISE_CATEGORIES.map((category) => [category.value, category]),
);

const FALLBACK_CATEGORY: ExerciseCategory = {
  value: "other",
  label: "その他",
  color: "oklch(0.6 0.02 260)",
};

export function getExerciseCategory(
  value: string | null | undefined,
): ExerciseCategory {
  if (!value) return FALLBACK_CATEGORY;
  return (
    CATEGORY_BY_VALUE.get(value as ExerciseCategoryValue) ?? FALLBACK_CATEGORY
  );
}

export function isExerciseCategoryValue(
  value: string,
): value is ExerciseCategoryValue {
  return CATEGORY_BY_VALUE.has(value as ExerciseCategoryValue);
}
