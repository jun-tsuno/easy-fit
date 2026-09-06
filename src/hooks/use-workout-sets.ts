import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/amplify-client";

function workoutSetsQueryKey(date: string) {
  return ["workoutSets", date];
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

type CreateWorkoutSetInput = {
  date: string;
  exerciseId: string;
  weight: number;
  reps: number;
  setNumber: number;
};

export function useCreateWorkoutSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateWorkoutSetInput) => {
      const { data, errors } = await client.models.WorkoutSet.create(input);
      if (errors) {
        throw new Error(errors.map((error) => error.message).join(", "));
      }
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: workoutSetsQueryKey(variables.date),
      });
    },
  });
}

export function useDeleteWorkoutSet(date: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, errors } = await client.models.WorkoutSet.delete({ id });
      if (errors) {
        throw new Error(errors.map((error) => error.message).join(", "));
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutSetsQueryKey(date) });
    },
  });
}
