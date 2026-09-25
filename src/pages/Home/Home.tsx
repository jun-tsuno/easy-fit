import { Button, IconButton, Skeleton, Spinner } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import {
  LuCalendarCheck,
  LuChevronRight,
  LuLayers,
  LuNotebookPen,
  LuScale,
  LuTrendingUp,
  LuUser,
} from "react-icons/lu";
import { Link } from "react-router";
import { Calendar } from "@/components/Calendar/Calendar";
import { CategoryDot } from "@/components/CategoryDot/CategoryDot";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { useBodyWeightsInRange } from "@/hooks/useBodyWeight";
import { useExercises } from "@/hooks/useExercises";
import { useWorkoutSetsInRange } from "@/hooks/useWorkoutSets";
import {
  formatShortDate,
  getCalendarDays,
  getTodayDateString,
  getWeekRange,
  toDateString,
} from "@/utils/date";
import { EXERCISE_CATEGORIES } from "@/utils/exerciseCategories";
import styles from "./Home.module.css";

const UNASSIGNED_COLOR = "oklch(0.55 0 0)";
const UNASSIGNED_CATEGORY = {
  value: "unassigned",
  label: "未設定",
  color: UNASSIGNED_COLOR,
};

export function HomePage() {
  const today = getTodayDateString();

  // カレンダーでタップした日付。この日を含む週の記録をサマリーに表示する
  const [selectedDate, setSelectedDate] = useState(today);

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  const { rangeStart, rangeEnd } = useMemo(() => {
    const days = getCalendarDays(visibleMonth.year, visibleMonth.month);
    return {
      rangeStart: toDateString(days[0]),
      rangeEnd: toDateString(days[days.length - 1]),
    };
  }, [visibleMonth]);

  // カレンダーの記録アイコンは「表示中の月」を含む6週間ぶんを取得
  const { data: workoutSets } = useWorkoutSetsInRange(rangeStart, rangeEnd);
  const { data: bodyWeights } = useBodyWeightsInRange(rangeStart, rangeEnd);

  const workoutDates = useMemo(
    () => new Set((workoutSets ?? []).map((set) => set.date)),
    [workoutSets],
  );

  const weightDates = useMemo(
    () => new Set((bodyWeights ?? []).map((record) => record.date)),
    [bodyWeights],
  );

  // 週サマリーは、カレンダーで選択された日付を含む週(月〜日)を対象に取得する
  const selectedWeek = useMemo(
    () => getWeekRange(selectedDate),
    [selectedDate],
  );
  const isCurrentWeek = selectedWeek.start === getWeekRange(today).start;
  const { data: weekSets, isPending: isWeekPending } = useWorkoutSetsInRange(
    selectedWeek.start,
    selectedWeek.end,
  );
  const { data: weekWeights } = useBodyWeightsInRange(
    selectedWeek.start,
    selectedWeek.end,
  );
  const { data: exercises } = useExercises();

  const weekSummary = useMemo(() => {
    const latestWeight = (weekWeights ?? [])
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    return {
      trainingDays: new Set((weekSets ?? []).map((set) => set.date)).size,
      totalSets: (weekSets ?? []).length,
      totalVolume: (weekSets ?? []).reduce(
        (sum, set) => sum + set.weight * set.reps,
        0,
      ),
      latestWeight: latestWeight ?? null,
    };
  }, [weekSets, weekWeights]);

  // その週の記録を種目ごとに集計してから、カテゴリ(腕・胸…)ごとにグルーピングする
  const weekCategoryGroups = useMemo(() => {
    const exerciseById = new Map(
      (exercises ?? []).map((exercise) => [exercise.id, exercise]),
    );
    const setsByExerciseId = new Map<string, NonNullable<typeof weekSets>>();
    for (const set of weekSets ?? []) {
      const sets = setsByExerciseId.get(set.exerciseId);
      if (sets) sets.push(set);
      else setsByExerciseId.set(set.exerciseId, [set]);
    }

    const summarize = (
      exerciseId: string,
      sets: NonNullable<typeof weekSets>,
    ) => {
      const exercise = exerciseById.get(exerciseId);
      return {
        exerciseId,
        exerciseName: exercise?.name ?? "未設定の種目",
        setCount: sets.length,
        totalReps: sets.reduce((sum, set) => sum + set.reps, 0),
        maxWeight: Math.max(...sets.map((set) => set.weight)),
        totalVolume: sets.reduce((sum, set) => sum + set.weight * set.reps, 0),
      };
    };

    const entries = Array.from(setsByExerciseId.entries());

    const grouped = EXERCISE_CATEGORIES.map((category) => {
      const items = entries
        .filter(
          ([exerciseId]) =>
            exerciseById.get(exerciseId)?.category === category.value,
        )
        .map(([exerciseId, sets]) => summarize(exerciseId, sets))
        .sort((a, b) => b.totalVolume - a.totalVolume);
      return { category, items };
    }).filter((group) => group.items.length > 0);

    const orphanedItems = entries
      .filter(([exerciseId]) => !exerciseById.has(exerciseId))
      .map(([exerciseId, sets]) => summarize(exerciseId, sets))
      .sort((a, b) => b.totalVolume - a.totalVolume);

    const unassignedGroup = {
      category: UNASSIGNED_CATEGORY,
      items: orphanedItems,
    };

    return orphanedItems.length > 0 ? [...grouped, unassignedGroup] : grouped;
  }, [weekSets, exercises]);

  return (
    <PageContainer>
      <header className={styles.header}>
        <img src="/logo.svg" alt="easy-fit" className={styles.logo} />
        <IconButton variant="ghost" aria-label="マイページ" asChild>
          <Link to="/mypage">
            <LuUser />
          </Link>
        </IconButton>
      </header>

      <main className={styles.main}>
        <Calendar
          year={visibleMonth.year}
          month={visibleMonth.month}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onMonthChange={(year, month) => setVisibleMonth({ year, month })}
          workoutDates={workoutDates}
          weightDates={weightDates}
        />

        <section className={styles.summary}>
          <h2 className={styles.summaryTitle}>
            {isCurrentWeek ? "今週の記録" : "選択した週の記録"}
            <span className={styles.summaryRange}>
              {formatShortDate(selectedWeek.start)} –{" "}
              {formatShortDate(selectedWeek.end)}
              {!isCurrentWeek && (
                <button
                  type="button"
                  className={styles.thisWeekButton}
                  onClick={() => setSelectedDate(today)}
                >
                  今週
                </button>
              )}
            </span>
          </h2>
          {isWeekPending ? (
            <div className={styles.loadingRow}>
              <Spinner color="fg.muted" />
            </div>
          ) : (
            <dl className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <dt className={styles.summaryLabel}>
                  <LuCalendarCheck className={styles.summaryIcon} />
                  トレーニング
                </dt>
                <dd className={styles.summaryValue}>
                  {weekSummary.trainingDays}
                  <span className={styles.summaryUnit}>日</span>
                </dd>
              </div>
              <div className={styles.summaryItem}>
                <dt className={styles.summaryLabel}>
                  <LuLayers className={styles.summaryIcon} />
                  合計セット
                </dt>
                <dd className={styles.summaryValue}>
                  {weekSummary.totalSets}
                  <span className={styles.summaryUnit}>セット</span>
                </dd>
              </div>
              <div className={styles.summaryItem}>
                <dt className={styles.summaryLabel}>
                  <LuTrendingUp className={styles.summaryIcon} />
                  総挙上量
                </dt>
                <dd className={styles.summaryValue}>
                  {Math.round(weekSummary.totalVolume).toLocaleString()}
                  <span className={styles.summaryUnit}>kg</span>
                </dd>
              </div>
              <div className={styles.summaryItem}>
                <dt className={styles.summaryLabel}>
                  <LuScale className={styles.summaryIcon} />
                  体重
                </dt>
                <dd className={styles.summaryValue}>
                  <Link
                    to={`/body-weight?date=${today}`}
                    className={styles.weightLink}
                  >
                    {weekSummary.latestWeight ? (
                      <>
                        {weekSummary.latestWeight.weight}
                        <span className={styles.summaryUnit}>kg</span>
                      </>
                    ) : (
                      <span className={styles.summaryUnit}>記録する</span>
                    )}
                    <LuChevronRight className={styles.weightChevron} />
                  </Link>
                </dd>
              </div>
            </dl>
          )}

          <div className={styles.exerciseSummary}>
            <h3 className={styles.exerciseSummaryTitle}>種目別の記録</h3>
            {isWeekPending ? (
              <div className={styles.exerciseList}>
                <Skeleton height="4.25rem" borderRadius="var(--radius-card)" />
                <Skeleton height="4.25rem" borderRadius="var(--radius-card)" />
                <Skeleton height="4.25rem" borderRadius="var(--radius-card)" />
              </div>
            ) : weekCategoryGroups.length === 0 ? (
              <p className={styles.emptyText}>
                この週のトレーニング記録はまだありません。
              </p>
            ) : (
              <div className={styles.categoryList}>
                {weekCategoryGroups.map((group) => (
                  <div
                    key={group.category.value}
                    className={styles.categorySection}
                  >
                    <h4 className={styles.categoryTitle}>
                      <CategoryDot color={group.category.color} />
                      {group.category.label}
                    </h4>
                    <ul className={styles.exerciseList}>
                      {group.items.map((item) => (
                        <li
                          key={item.exerciseId}
                          className={styles.exerciseItem}
                        >
                          <span className={styles.exerciseName}>
                            {item.exerciseName}
                          </span>
                          <dl className={styles.exerciseStats}>
                            <div className={styles.exerciseStat}>
                              <dt className={styles.exerciseStatLabel}>
                                セット数
                              </dt>
                              <dd className={styles.exerciseStatValue}>
                                {item.setCount}
                                <span className={styles.summaryUnit}>
                                  セット
                                </span>
                              </dd>
                            </div>
                            <div className={styles.exerciseStat}>
                              <dt className={styles.exerciseStatLabel}>
                                Rep数
                              </dt>
                              <dd className={styles.exerciseStatValue}>
                                {item.totalReps}
                                <span className={styles.summaryUnit}>回</span>
                              </dd>
                            </div>
                            <div className={styles.exerciseStat}>
                              <dt className={styles.exerciseStatLabel}>
                                最大重量
                              </dt>
                              <dd className={styles.exerciseStatValue}>
                                {item.maxWeight}
                                <span className={styles.summaryUnit}>kg</span>
                              </dd>
                            </div>
                          </dl>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <div className={styles.recordBar}>
        <Button size="lg" w="full" boxShadow="lg" asChild>
          <Link to={`/record?date=${today}`}>
            <LuNotebookPen />
            トレーニングを記録
          </Link>
        </Button>
      </div>
    </PageContainer>
  );
}
