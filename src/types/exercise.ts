export type ExerciseCategoryValue =
  | "chest"
  | "back"
  | "shoulder"
  | "arm"
  | "leg"
  | "cardio"
  | "other";

export type ExerciseCategory = {
  value: ExerciseCategoryValue;
  label: string;
  color: string;
};

export type Exercise = {
  id: string;
  name: string;
  category?: string | null;
};
