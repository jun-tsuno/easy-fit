import {
  createListCollection,
  Portal,
  SegmentGroup,
  Select,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { LuChartLine, LuScale } from "react-icons/lu";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import {
  StatsLineChart,
  type StatsLinePoint,
} from "@/components/StatsLineChart/StatsLineChart";
import { useBodyWeightsInRange } from "@/hooks/useBodyWeight";
import { useExercises } from "@/hooks/useExercises";
import { useWorkoutSetsByExerciseInRange } from "@/hooks/useWorkoutSets";
import { getStatsBuckets, type StatsPeriod } from "@/utils/date";
import {
  aggregateBodyWeights,
  aggregateWorkoutSets,
  average,
  type WorkoutMetric,
} from "@/utils/stats";
import styles from "./Stats.module.css";

const PERIOD_ITEMS: { value: StatsPeriod; label: string }[] = [
  { value: "week", label: "週" },
  { value: "month", label: "月" },
  { value: "year", label: "年" },
];

const METRIC_ITEMS: { value: WorkoutMetric; label: string }[] = [
  { value: "maxWeight", label: "最大重量" },
  { value: "totalVolume", label: "総挙上量" },
];

function formatKg(value: number | null): string {
  return value == null ? "—" : `${value.toLocaleString()}kg`;
}

export function StatsPage() {
  const [period, setPeriod] = useState<StatsPeriod>("month");

  const buckets = useMemo(() => getStatsBuckets(period), [period]);
  const range = useMemo(
    () => ({
      start: buckets[0].start,
      end: buckets[buckets.length - 1].end,
    }),
    [buckets],
  );

  return (
    <PageContainer>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <LuChartLine />
          グラフ
        </h1>
      </header>

      <SegmentGroup.Root
        className={styles.periodToggle}
        value={period}
        onValueChange={(details) => {
          if (details.value) setPeriod(details.value as StatsPeriod);
        }}
      >
        <SegmentGroup.Indicator />
        {PERIOD_ITEMS.map((item) => (
          <SegmentGroup.Item key={item.value} value={item.value}>
            <SegmentGroup.ItemText>{item.label}</SegmentGroup.ItemText>
            <SegmentGroup.ItemHiddenInput />
          </SegmentGroup.Item>
        ))}
      </SegmentGroup.Root>

      <main className={styles.main}>
        <BodyWeightSection
          buckets={buckets}
          rangeStart={range.start}
          rangeEnd={range.end}
        />
        <ExerciseSection
          buckets={buckets}
          rangeStart={range.start}
          rangeEnd={range.end}
        />
      </main>
    </PageContainer>
  );
}

type SectionProps = {
  buckets: ReturnType<typeof getStatsBuckets>;
  rangeStart: string;
  rangeEnd: string;
};

function BodyWeightSection({ buckets, rangeStart, rangeEnd }: SectionProps) {
  const { data, isPending, isError } = useBodyWeightsInRange(
    rangeStart,
    rangeEnd,
  );

  const points: StatsLinePoint[] = useMemo(() => {
    const aggregated = aggregateBodyWeights(data ?? [], buckets);
    return aggregated.map((point) => ({
      label: point.label,
      value: point.avgWeight,
    }));
  }, [data, buckets]);

  const avg = useMemo(() => average(points.map((p) => p.value)), [points]);
  const hasData = points.some((point) => point.value != null);

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>
          <LuScale className={styles.cardIcon} />
          体重の推移
        </h2>
        <p className={styles.cardStat}>
          平均 <strong>{formatKg(avg)}</strong>
        </p>
      </div>
      {isPending ? (
        <div className={styles.loadingRow}>
          <Spinner color="fg.muted" />
        </div>
      ) : isError ? (
        <p className={styles.error}>体重記録の取得に失敗しました。</p>
      ) : hasData ? (
        <StatsLineChart data={points} formatTick={(v) => `${v}`} />
      ) : (
        <p className={styles.emptyText}>この期間の体重記録はありません。</p>
      )}
    </section>
  );
}

function ExerciseSection({ buckets, rangeStart, rangeEnd }: SectionProps) {
  const { data: exercises, isPending: isExercisesPending } = useExercises();
  const [exerciseId, setExerciseId] = useState("");
  const [metric, setMetric] = useState<WorkoutMetric>("maxWeight");

  useEffect(() => {
    if (exerciseId === "" && exercises && exercises.length > 0) {
      setExerciseId(exercises[0].id);
    }
  }, [exercises, exerciseId]);

  const collection = useMemo(
    () =>
      createListCollection({
        items: exercises ?? [],
        itemToString: (item) => item.name,
        itemToValue: (item) => item.id,
      }),
    [exercises],
  );

  const {
    data: sets,
    isPending,
    isError,
  } = useWorkoutSetsByExerciseInRange(exerciseId, rangeStart, rangeEnd);

  const points: StatsLinePoint[] = useMemo(() => {
    const aggregated = aggregateWorkoutSets(sets ?? [], buckets);
    return aggregated.map((point) => ({
      label: point.label,
      value: metric === "maxWeight" ? point.maxWeight : point.totalVolume,
    }));
  }, [sets, buckets, metric]);

  const avg = useMemo(() => average(points.map((p) => p.value)), [points]);
  const hasData = points.some((point) => point.value != null);
  const hasExercises = (exercises?.length ?? 0) > 0;

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>
          <LuChartLine className={styles.cardIcon} />
          種目別の記録推移
        </h2>
        <p className={styles.cardStat}>
          平均 <strong>{formatKg(avg)}</strong>
        </p>
      </div>

      {isExercisesPending ? (
        <div className={styles.loadingRow}>
          <Spinner color="fg.muted" />
        </div>
      ) : !hasExercises ? (
        <p className={styles.emptyText}>
          種目が登録されていません。まず種目を追加してください。
        </p>
      ) : (
        <>
          <div className={styles.controls}>
            <Select.Root
              collection={collection}
              value={exerciseId ? [exerciseId] : []}
              onValueChange={(details) => setExerciseId(details.value[0] ?? "")}
              size="sm"
            >
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="種目を選択" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {(exercises ?? []).map((exercise) => (
                      <Select.Item item={exercise} key={exercise.id}>
                        <Select.ItemText>{exercise.name}</Select.ItemText>
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>

            <SegmentGroup.Root
              size="sm"
              value={metric}
              onValueChange={(details) => {
                if (details.value) setMetric(details.value as WorkoutMetric);
              }}
            >
              <SegmentGroup.Indicator />
              {METRIC_ITEMS.map((item) => (
                <SegmentGroup.Item key={item.value} value={item.value}>
                  <SegmentGroup.ItemText>{item.label}</SegmentGroup.ItemText>
                  <SegmentGroup.ItemHiddenInput />
                </SegmentGroup.Item>
              ))}
            </SegmentGroup.Root>
          </div>

          {isPending ? (
            <div className={styles.loadingRow}>
              <Spinner color="fg.muted" />
            </div>
          ) : isError ? (
            <p className={styles.error}>記録の取得に失敗しました。</p>
          ) : hasData ? (
            <StatsLineChart
              data={points}
              formatTick={(v) =>
                metric === "totalVolume" && v >= 1000
                  ? `${Math.round(v / 100) / 10}k`
                  : `${v}`
              }
            />
          ) : (
            <p className={styles.emptyText}>
              この期間にこの種目の記録はありません。
            </p>
          )}
        </>
      )}
    </section>
  );
}
