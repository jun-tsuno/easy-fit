import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/amplifyClient";
import { useAuth } from "@/providers/AuthProvider";

function bodyWeightQueryKey(date: string) {
  return ["bodyWeight", date];
}

// owner + date の専用GSI(listBodyWeightsByDate)を使い、date をソートキー条件に
// した範囲クエリにする(理由は useWorkoutSets.ts の同様の関数を参照)
async function fetchBodyWeightByDate(owner: string, date: string) {
  const { data, errors } = await client.models.BodyWeight.listBodyWeightsByDate(
    { owner, date: { eq: date } },
  );
  if (errors) throw new Error(errors.map((error) => error.message).join(", "));
  return data[0] ?? null;
}

export function useBodyWeightByDate(date: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: bodyWeightQueryKey(date),
    queryFn: () => fetchBodyWeightByDate(user?.userId ?? "", date),
    enabled: !!user,
  });
}

async function fetchBodyWeightsInRange(
  owner: string,
  start: string,
  end: string,
) {
  const { data, errors } = await client.models.BodyWeight.listBodyWeightsByDate(
    { owner, date: { between: [start, end] } },
    { limit: 1000 },
  );
  if (errors) throw new Error(errors.map((error) => error.message).join(", "));
  return data;
}

export function useBodyWeightsInRange(start: string, end: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["bodyWeight", "range", start, end],
    queryFn: () => fetchBodyWeightsInRange(user?.userId ?? "", start, end),
    enabled: !!user,
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
