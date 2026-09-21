import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/amplifyClient";
import type { ExerciseCategoryValue } from "@/types/exercise";

const exercisesQueryKey = ["exercises"];

async function fetchExercises() {
  const { data, errors } = await client.models.Exercise.list();
  if (errors) throw new Error(errors.map((error) => error.message).join(", "));
  return data;
}

export function useExercises() {
  return useQuery({
    queryKey: exercisesQueryKey,
    queryFn: fetchExercises,
  });
}

type CreateExerciseInput = {
  name: string;
  category: ExerciseCategoryValue;
};

export function useCreateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateExerciseInput) => {
      const { data, errors } = await client.models.Exercise.create(input);
      if (errors) {
        throw new Error(errors.map((error) => error.message).join(", "));
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exercisesQueryKey });
    },
  });
}

type UpdateExerciseInput = {
  id: string;
  name: string;
};

// id は変えずに name だけ更新する。WorkoutSet は exerciseId で参照しているため、
// 過去の記録との紐づきは保たれる
export function useUpdateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateExerciseInput) => {
      const { data, errors } = await client.models.Exercise.update(input);
      if (errors) {
        throw new Error(errors.map((error) => error.message).join(", "));
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exercisesQueryKey });
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, errors } = await client.models.Exercise.delete({ id });
      if (errors) {
        throw new Error(errors.map((error) => error.message).join(", "));
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exercisesQueryKey });
    },
  });
}
