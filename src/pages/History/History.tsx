import { SegmentGroup, Spinner } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { LuDumbbell, LuScale } from "react-icons/lu";
import { CategoryDot } from "@/components/CategoryDot/CategoryDot";
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
  EXERCISE_CATEGORIES,
  isExerciseCategoryValue,
} from "@/utils/exerciseCategories";
import {
  aggregateBodyWeights,
  aggregateWorkoutSets,
  average,
  type WorkoutMetric,
} from "@/utils/stats";
import styles from "./History.module.css";

const UNCATEGORIZED = "uncategorized";

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

export function HistoryPage() {
  const [period, setPeriod] = useState<StatsPeriod>("week");

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
        <h1 className={styles.title}>履歴</h1>
      </header>

      <SegmentGroup.Root
        className={styles.periodToggle}
        size="lg"
        width="full"
        value={period}
        onValueChange={(details) => {
          if (details.value) setPeriod(details.value as StatsPeriod);
        }}
      >
        <SegmentGroup.Indicator />
        {PERIOD_ITEMS.map((item) => (
          <SegmentGroup.Item key={item.value} value={item.value} flex="1">
            <SegmentGroup.ItemText>{item.label}</SegmentGroup.ItemText>
            <SegmentGroup.ItemHiddenInput />
          </SegmentGroup.Item>
        ))}
      </SegmentGroup.Root>

      <main className={styles.main}>
        <ExerciseSection
          buckets={buckets}
          rangeStart={range.start}
          rangeEnd={range.end}
        />
        <BodyWeightSection
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
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>
          <LuScale className={styles.sectionIcon} />
          体重の推移
        </h2>
        <p className={styles.sectionStat}>
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
        <StatsLineChart
          data={points}
          color="var(--color-secondary)"
          formatTick={(v) => `${v}`}
        />
      ) : (
        <p className={styles.emptyText}>この期間の体重記録はありません。</p>
      )}
    </section>
  );
}

function ExerciseSection({ buckets, rangeStart, rangeEnd }: SectionProps) {
  const { data: exercises, isPending: isExercisesPending } = useExercises();
  const [categoryValue, setCategoryValue] = useState("");
  const [exerciseId, setExerciseId] = useState("");
  const [metric, setMetric] = useState<WorkoutMetric>("maxWeight");

  const categoryGroups = useMemo(() => {
    const items = exercises ?? [];
    const groups = EXERCISE_CATEGORIES.map((cat) => ({
      value: cat.value as string,
      label: cat.label,
      color: cat.color,
      items: items.filter((exercise) => exercise.category === cat.value),
    })).filter((group) => group.items.length > 0);

    const uncategorized = items.filter(
      (exercise) => !isExerciseCategoryValue(exercise.category ?? ""),
    );
    if (uncategorized.length > 0) {
      groups.push({
        value: UNCATEGORIZED,
        label: "未分類",
        color: "var(--color-fg-muted)",
        items: uncategorized,
      });
    }
    return groups;
  }, [exercises]);

  const currentGroup = categoryGroups.find(
    (group) => group.value === categoryValue,
  );

  // 種目データ取得後、未選択なら先頭のカテゴリを自動選択する
  useEffect(() => {
    if (categoryValue === "" && categoryGroups.length > 0) {
      setCategoryValue(categoryGroups[0].value);
    }
  }, [categoryGroups, categoryValue]);

  // カテゴリ切替などで選択中の種目が属さなくなった場合、そのカテゴリの先頭種目を選び直す
  useEffect(() => {
    if (!currentGroup) return;
    const stillValid = currentGroup.items.some(
      (exercise) => exercise.id === exerciseId,
    );
    if (!stillValid) {
      setExerciseId(currentGroup.items[0]?.id ?? "");
    }
  }, [currentGroup, exerciseId]);

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
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>
          <LuDumbbell className={styles.sectionIcon} />
          種目別の記録推移
        </h2>
        <p className={styles.sectionStat}>
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
            <TabRow
              items={categoryGroups.map((group) => ({
                value: group.value,
                label: group.label,
                color: group.color,
              }))}
              value={categoryValue}
              onChange={setCategoryValue}
              ariaLabel="カテゴリ"
            />
            <TabRow
              items={(currentGroup?.items ?? []).map((exercise) => ({
                value: exercise.id,
                label: exercise.name,
              }))}
              value={exerciseId}
              onChange={setExerciseId}
              ariaLabel="種目"
            />

            <SegmentGroup.Root
              size="md"
              value={metric}
              onValueChange={(details) => {
                if (details.value) setMetric(details.value as WorkoutMetric);
              }}
            >
              <SegmentGroup.Indicator />
              {METRIC_ITEMS.map((item) => (
                <SegmentGroup.Item key={item.value} value={item.value} flex="1">
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

type TabItem = { value: string; label: string; color?: string };

function TabRow({
  items,
  value,
  onChange,
  ariaLabel,
}: {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  const activeRef = useRef<HTMLButtonElement | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: 選択値が変わるたびアクティブなタブへスクロールする
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [value]);

  return (
    <div className={styles.tabScroll} role="tablist" aria-label={ariaLabel}>
      {items.map((item) => {
        const isActive = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            ref={isActive ? activeRef : undefined}
            className={
              isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab
            }
            onClick={() => onChange(item.value)}
          >
            {item.color && <CategoryDot color={item.color} />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
