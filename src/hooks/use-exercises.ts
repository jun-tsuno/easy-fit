import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/amplify-client";

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
  category?: string;
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
