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
import { Link, useNavigate } from "react-router";
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
import { getExerciseCategory } from "@/utils/exerciseCategories";
import styles from "./Home.module.css";

const UNASSIGNED_COLOR = "oklch(0.55 0 0)";

export function HomePage() {
  const navigate = useNavigate();
  const today = getTodayDateString();

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

  // 週サマリーは常に「今週」(本日を含む日〜土)を対象に別途取得する
  const currentWeek = useMemo(() => getWeekRange(today), [today]);
  const { data: weekSets, isPending: isWeekPending } = useWorkoutSetsInRange(
    currentWeek.start,
    currentWeek.end,
  );
  const { data: weekWeights } = useBodyWeightsInRange(
    currentWeek.start,
    currentWeek.end,
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

  // 今週の記録を種目ごとにグルーピングし、直近の総挙上量が多い順に並べる
  const weekExerciseSummaries = useMemo(() => {
    const exerciseById = new Map(
      (exercises ?? []).map((exercise) => [exercise.id, exercise]),
    );
    const setsByExerciseId = new Map<string, NonNullable<typeof weekSets>>();
    for (const set of weekSets ?? []) {
      const sets = setsByExerciseId.get(set.exerciseId);
      if (sets) sets.push(set);
      else setsByExerciseId.set(set.exerciseId, [set]);
    }

    return Array.from(setsByExerciseId.entries())
      .map(([exerciseId, sets]) => {
        const exercise = exerciseById.get(exerciseId);
        return {
          exerciseId,
          exerciseName: exercise?.name ?? "未設定の種目",
          categoryColor: exercise
            ? getExerciseCategory(exercise.category).color
            : UNASSIGNED_COLOR,
          setCount: sets.length,
          totalReps: sets.reduce((sum, set) => sum + set.reps, 0),
          maxWeight: Math.max(...sets.map((set) => set.weight)),
          totalVolume: sets.reduce(
            (sum, set) => sum + set.weight * set.reps,
            0,
          ),
        };
      })
      .sort((a, b) => b.totalVolume - a.totalVolume);
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
          selectedDate={today}
          onSelectDate={(date) => navigate(`/record?date=${date}`)}
          onMonthChange={(year, month) => setVisibleMonth({ year, month })}
          workoutDates={workoutDates}
          weightDates={weightDates}
        />

        <section className={styles.summary}>
          <h2 className={styles.summaryTitle}>
            今週の記録
            <span className={styles.summaryRange}>
              {formatShortDate(currentWeek.start)} –{" "}
              {formatShortDate(currentWeek.end)}
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
            ) : weekExerciseSummaries.length === 0 ? (
              <p className={styles.emptyText}>
                この週のトレーニング記録はまだありません。
              </p>
            ) : (
              <ul className={styles.exerciseList}>
                {weekExerciseSummaries.map((item) => (
                  <li key={item.exerciseId} className={styles.exerciseItem}>
                    <div className={styles.exerciseItemHead}>
                      <CategoryDot color={item.categoryColor} />
                      <span className={styles.exerciseName}>
                        {item.exerciseName}
                      </span>
                    </div>
                    <dl className={styles.exerciseStats}>
                      <div className={styles.exerciseStat}>
                        <dt className={styles.exerciseStatLabel}>セット数</dt>
                        <dd className={styles.exerciseStatValue}>
                          {item.setCount}
                          <span className={styles.summaryUnit}>セット</span>
                        </dd>
                      </div>
                      <div className={styles.exerciseStat}>
                        <dt className={styles.exerciseStatLabel}>Rep数</dt>
                        <dd className={styles.exerciseStatValue}>
                          {item.totalReps}
                          <span className={styles.summaryUnit}>回</span>
                        </dd>
                      </div>
                      <div className={styles.exerciseStat}>
                        <dt className={styles.exerciseStatLabel}>最大重量</dt>
                        <dd className={styles.exerciseStatValue}>
                          {item.maxWeight}
                          <span className={styles.summaryUnit}>kg</span>
                        </dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      <div className={styles.recordBar}>
        <Button size="lg" w="full" boxShadow="lg" asChild>
          <Link to={`/record?date=${today}`}>
            <LuNotebookPen />
            本日のトレーニングを記録
          </Link>
        </Button>
      </div>
    </PageContainer>
  );
}
