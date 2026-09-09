import type { StatsBucket } from "./date";

/** 種目別グラフで表示する指標 */
export type WorkoutMetric = "maxWeight" | "totalVolume";

type SetLike = { date: string; weight: number; reps: number };
type WeightLike = { date: string; weight: number };

export type WorkoutBucketPoint = {
  key: string;
  label: string;
  /** その期間のセットの最大重量。記録がなければ null */
  maxWeight: number | null;
  /** その期間の総挙上量 Σ(重量×回数)。記録がなければ null */
  totalVolume: number | null;
  /** その期間の重量の平均値。記録がなければ null */
  avgWeight: number | null;
};

export type BodyWeightBucketPoint = {
  key: string;
  label: string;
  /** その期間の体重の平均値。記録がなければ null */
  avgWeight: number | null;
};

function inBucket(date: string, bucket: StatsBucket): boolean {
  return date >= bucket.start && date <= bucket.end;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** セット記録をバケットごとに集計する（古い順） */
export function aggregateWorkoutSets(
  sets: readonly SetLike[],
  buckets: readonly StatsBucket[],
): WorkoutBucketPoint[] {
  return buckets.map((bucket) => {
    const inRange = sets.filter((set) => inBucket(set.date, bucket));
    if (inRange.length === 0) {
      return {
        key: bucket.key,
        label: bucket.label,
        maxWeight: null,
        totalVolume: null,
        avgWeight: null,
      };
    }
    return {
      key: bucket.key,
      label: bucket.label,
      maxWeight: Math.max(...inRange.map((set) => set.weight)),
      totalVolume: round1(
        inRange.reduce((sum, set) => sum + set.weight * set.reps, 0),
      ),
      avgWeight: round1(
        inRange.reduce((sum, set) => sum + set.weight, 0) / inRange.length,
      ),
    };
  });
}

/** 体重記録をバケットごとに平均で集計する（古い順） */
export function aggregateBodyWeights(
  weights: readonly WeightLike[],
  buckets: readonly StatsBucket[],
): BodyWeightBucketPoint[] {
  return buckets.map((bucket) => {
    const inRange = weights.filter((weight) => inBucket(weight.date, bucket));
    if (inRange.length === 0) {
      return { key: bucket.key, label: bucket.label, avgWeight: null };
    }
    return {
      key: bucket.key,
      label: bucket.label,
      avgWeight: round1(
        inRange.reduce((sum, weight) => sum + weight.weight, 0) /
          inRange.length,
      ),
    };
  });
}

/** null を除いた平均値。全て null なら null */
export function average(values: readonly (number | null)[]): number | null {
  const numbers = values.filter((value): value is number => value != null);
  if (numbers.length === 0) return null;
  return round1(
    numbers.reduce((sum, value) => sum + value, 0) / numbers.length,
  );
}
