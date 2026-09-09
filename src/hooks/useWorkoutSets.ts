import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/amplifyClient";

function workoutSetsQueryKey(date: string, exerciseId?: string) {
  return exerciseId ? ["workoutSets", date, exerciseId] : ["workoutSets", date];
}

async function fetchWorkoutSetsByDate(date: string) {
  const { data, errors } = await client.models.WorkoutSet.list({
    filter: { date: { eq: date } },
  });
  if (errors) throw new Error(errors.map((error) => error.message).join(", "));
  return data;
}

export function useWorkoutSetsByDate(date: string) {
  return useQuery({
    queryKey: workoutSetsQueryKey(date),
    queryFn: () => fetchWorkoutSetsByDate(date),
  });
}

async function fetchWorkoutSetsInRange(start: string, end: string) {
  const { data, errors } = await client.models.WorkoutSet.list({
    filter: { and: [{ date: { ge: start } }, { date: { le: end } }] },
    limit: 1000,
  });
  if (errors) throw new Error(errors.map((error) => error.message).join(", "));
  return data;
}

export function useWorkoutSetsInRange(start: string, end: string) {
  return useQuery({
    queryKey: ["workoutSets", "range", start, end],
    queryFn: () => fetchWorkoutSetsInRange(start, end),
  });
}

async function fetchWorkoutSetsByExerciseInRange(
  exerciseId: string,
  start: string,
  end: string,
) {
  const { data, errors } =
    await client.models.WorkoutSet.listWorkoutSetsByExerciseDate(
      { exerciseId, date: { between: [start, end] } },
      { limit: 1000 },
    );
  if (errors) throw new Error(errors.map((error) => error.message).join(", "));
  return data;
}

export function useWorkoutSetsByExerciseInRange(
  exerciseId: string,
  start: string,
  end: string,
) {
  return useQuery({
    queryKey: ["workoutSets", "exerciseRange", exerciseId, start, end],
    queryFn: () => fetchWorkoutSetsByExerciseInRange(exerciseId, start, end),
    enabled: exerciseId !== "",
  });
}

async function fetchWorkoutSetsByExercise(date: string, exerciseId: string) {
  const { data, errors } = await client.models.WorkoutSet.list({
    filter: {
      and: [{ date: { eq: date } }, { exerciseId: { eq: exerciseId } }],
    },
  });
  if (errors) throw new Error(errors.map((error) => error.message).join(", "));
  return data;
}

export function useWorkoutSetsByExercise(date: string, exerciseId: string) {
  return useQuery({
    queryKey: workoutSetsQueryKey(date, exerciseId),
    queryFn: () => fetchWorkoutSetsByExercise(date, exerciseId),
  });
}

/** 1セット分の保存内容。id があれば更新、なければ新規作成 */
export type WorkoutSetDraft = {
  id: string | null;
  weight: number;
  reps: number;
  setNumber: number;
};

type SaveExerciseSetsInput = {
  /** 保存対象のセット（配列順で setNumber を採番済み） */
  sets: WorkoutSetDraft[];
  /** 画面から削除された既存セットの id */
  deletedIds: string[];
};

function throwOnErrors(errors: readonly { message: string }[] | undefined) {
  if (errors?.length) {
    throw new Error(errors.map((error) => error.message).join(", "));
  }
}

/**
 * 指定日・種目のセット記録を「保存」ボタン押下時にまとめて反映する。
 * 削除 → 更新/新規作成 の順に適用する。
 */
export function useSaveExerciseSets(date: string, exerciseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sets, deletedIds }: SaveExerciseSetsInput) => {
      for (const id of deletedIds) {
        const { errors } = await client.models.WorkoutSet.delete({ id });
        throwOnErrors(errors);
      }
      for (const set of sets) {
        if (set.id) {
          const { errors } = await client.models.WorkoutSet.update({
            id: set.id,
            weight: set.weight,
            reps: set.reps,
            setNumber: set.setNumber,
          });
          throwOnErrors(errors);
        } else {
          const { errors } = await client.models.WorkoutSet.create({
            date,
            exerciseId,
            weight: set.weight,
            reps: set.reps,
            setNumber: set.setNumber,
          });
          throwOnErrors(errors);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workoutSets"] });
    },
  });
}
