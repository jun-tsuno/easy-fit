import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/amplifyClient";

function bodyWeightQueryKey(date: string) {
  return ["bodyWeight", date];
}

async function fetchBodyWeightByDate(date: string) {
  const { data, errors } = await client.models.BodyWeight.list({
    filter: { date: { eq: date } },
  });
  if (errors) throw new Error(errors.map((error) => error.message).join(", "));
  return data[0] ?? null;
}

export function useBodyWeightByDate(date: string) {
  return useQuery({
    queryKey: bodyWeightQueryKey(date),
    queryFn: () => fetchBodyWeightByDate(date),
  });
}

async function fetchBodyWeightsInRange(start: string, end: string) {
  const { data, errors } = await client.models.BodyWeight.list({
    filter: { and: [{ date: { ge: start } }, { date: { le: end } }] },
    limit: 1000,
  });
  if (errors) throw new Error(errors.map((error) => error.message).join(", "));
  return data;
}

export function useBodyWeightsInRange(start: string, end: string) {
  return useQuery({
    queryKey: ["bodyWeight", "range", start, end],
    queryFn: () => fetchBodyWeightsInRange(start, end),
  });
}

type SaveBodyWeightInput = {
  id: string | null;
  weight: number;
};

export function useSaveBodyWeight(date: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, weight }: SaveBodyWeightInput) => {
      const { data, errors } = id
        ? await client.models.BodyWeight.update({ id, weight })
        : await client.models.BodyWeight.create({ date, weight });
      if (errors) {
        throw new Error(errors.map((error) => error.message).join(", "));
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bodyWeightQueryKey(date) });
    },
  });
}
