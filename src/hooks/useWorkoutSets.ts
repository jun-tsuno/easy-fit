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
        queryKey: ["workoutSets", variables.date],
      });
    },
  });
}

type UpdateWorkoutSetInput = {
  id: string;
  date: string;
  weight: number;
  reps: number;
};

export function useUpdateWorkoutSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, weight, reps }: UpdateWorkoutSetInput) => {
      const { data, errors } = await client.models.WorkoutSet.update({
        id,
        weight,
        reps,
      });
      if (errors) {
        throw new Error(errors.map((error) => error.message).join(", "));
      }
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workoutSets", variables.date],
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
      queryClient.invalidateQueries({ queryKey: ["workoutSets", date] });
    },
  });
}
