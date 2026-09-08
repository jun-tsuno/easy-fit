import { Button, IconButton, Spinner } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { LuDumbbell, LuLogOut, LuNotebookPen, LuWeight } from "react-icons/lu";
import { Link } from "react-router";
import { Calendar } from "@/components/Calendar/Calendar";
import { CategoryDot } from "@/components/CategoryDot/CategoryDot";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { ThemeToggle } from "@/components/ThemeToggle/ThemeToggle";
import { useBodyWeightsInRange } from "@/hooks/useBodyWeight";
import { useExercises } from "@/hooks/useExercises";
import { useWorkoutSetsInRange } from "@/hooks/useWorkoutSets";
import { useAuth } from "@/providers/AuthProvider";
import titleStyles from "@/styles/brandTitle.module.css";
import {
  formatShortDate,
  getCalendarDays,
  getTodayDateString,
  getWeekRange,
  toDateString,
} from "@/utils/date";
import { EXERCISE_CATEGORIES } from "@/utils/exerciseCategories";
import styles from "./Home.module.css";

export function HomePage() {
  const { signOut } = useAuth();
  const today = getTodayDateString();

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [selectedDate, setSelectedDate] = useState(today);

  const { rangeStart, rangeEnd } = useMemo(() => {
    const days = getCalendarDays(visibleMonth.year, visibleMonth.month);
    return {
      rangeStart: toDateString(days[0]),
      rangeEnd: toDateString(days[days.length - 1]),
    };
  }, [visibleMonth]);

  const { data: exercises } = useExercises();
  const {
    data: workoutSets,
    isPending: isWorkoutPending,
    isError: isWorkoutError,
  } = useWorkoutSetsInRange(rangeStart, rangeEnd);
  const { data: bodyWeights } = useBodyWeightsInRange(rangeStart, rangeEnd);

  const workoutDates = useMemo(
    () => new Set((workoutSets ?? []).map((set) => set.date)),
    [workoutSets],
  );

  const bodyWeightByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const record of bodyWeights ?? []) {
      map.set(record.date, record.weight);
    }
    return map;
  }, [bodyWeights]);

  const calendarAnnotations = useMemo(() => {
    const map = new Map<string, string>();
    for (const [date, weight] of bodyWeightByDate) {
      map.set(date, `${weight}kg`);
    }
    return map;
  }, [bodyWeightByDate]);

  const groupedSelected = useMemo(() => {
    const selectedSets = (workoutSets ?? []).filter(
      (set) => set.date === selectedDate,
    );
    return EXERCISE_CATEGORIES.map((category) => {
      const items = (exercises ?? [])
        .filter((exercise) => exercise.category === category.value)
        .map((exercise) => ({
          exercise,
          sets: selectedSets
            .filter((set) => set.exerciseId === exercise.id)
            .sort((a, b) => a.setNumber - b.setNumber),
        }))
        .filter((item) => item.sets.length > 0);
      return { category, items };
    }).filter((group) => group.items.length > 0);
  }, [exercises, workoutSets, selectedDate]);

  const selectedBodyWeight = bodyWeightByDate.get(selectedDate) ?? null;

  const weekSummary = useMemo(() => {
    const { start, end } = getWeekRange(selectedDate);
    const setsInWeek = (workoutSets ?? []).filter(
      (set) => set.date >= start && set.date <= end,
    );
    const weightsInWeek = (bodyWeights ?? [])
      .filter((record) => record.date >= start && record.date <= end)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    return {
      start,
      end,
      trainingDays: new Set(setsInWeek.map((set) => set.date)).size,
      totalSets: setsInWeek.length,
      totalVolume: setsInWeek.reduce(
        (sum, set) => sum + set.weight * set.reps,
        0,
      ),
      latestWeight: weightsInWeek[0] ?? null,
    };
  }, [workoutSets, bodyWeights, selectedDate]);

  const isSelectedToday = selectedDate === today;

  return (
    <PageContainer>
      <header className={styles.header}>
        <h1 className={titleStyles.title}>easy-fit</h1>
        <div className={styles.headerActions}>
          <IconButton variant="outline" aria-label="種目管理" asChild>
            <Link to="/exercises">
              <LuDumbbell />
            </Link>
          </IconButton>
          <ThemeToggle />
          <IconButton
            variant="outline"
            aria-label="ログアウト"
            onClick={() => signOut()}
          >
            <LuLogOut />
          </IconButton>
        </div>
      </header>

      <main className={styles.main}>
        <Calendar
          year={visibleMonth.year}
          month={visibleMonth.month}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onMonthChange={(year, month) => setVisibleMonth({ year, month })}
          markedDates={workoutDates}
          annotations={calendarAnnotations}
        />

        <section className={styles.summary}>
          <h2 className={styles.summaryTitle}>
            今週の記録
            <span className={styles.summaryRange}>
              {formatShortDate(weekSummary.start)} –{" "}
              {formatShortDate(weekSummary.end)}
            </span>
          </h2>
          <dl className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <dt className={styles.summaryLabel}>トレーニング</dt>
              <dd className={styles.summaryValue}>
                {weekSummary.trainingDays}
                <span className={styles.summaryUnit}>日</span>
              </dd>
            </div>
            <div className={styles.summaryItem}>
              <dt className={styles.summaryLabel}>合計セット</dt>
              <dd className={styles.summaryValue}>
                {weekSummary.totalSets}
                <span className={styles.summaryUnit}>セット</span>
              </dd>
            </div>
            <div className={styles.summaryItem}>
              <dt className={styles.summaryLabel}>総挙上量</dt>
              <dd className={styles.summaryValue}>
                {Math.round(weekSummary.totalVolume).toLocaleString()}
                <span className={styles.summaryUnit}>kg</span>
              </dd>
            </div>
            <div className={styles.summaryItem}>
              <dt className={styles.summaryLabel}>体重</dt>
              <dd className={styles.summaryValue}>
                {weekSummary.latestWeight ? (
                  <>
                    {weekSummary.latestWeight.weight}
                    <span className={styles.summaryUnit}>kg</span>
                  </>
                ) : (
                  <span className={styles.summaryUnit}>記録なし</span>
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className={styles.detail}>
          <div className={styles.detailHead}>
            <h2 className={styles.detailTitle}>
              {isSelectedToday
                ? "今日のトレーニング"
                : `${formatShortDate(selectedDate)} のトレーニング`}
            </h2>
            <Link
              to={`/body-weight?date=${selectedDate}`}
              className={styles.detailWeight}
            >
              <LuWeight />
              {selectedBodyWeight !== null
                ? `${selectedBodyWeight}kg`
                : "体重を記録"}
            </Link>
          </div>

          {isWorkoutPending && (
            <div className={styles.loadingRow}>
              <Spinner color="fg.muted" />
            </div>
          )}
          {isWorkoutError && (
            <p className={styles.error}>記録の取得に失敗しました。</p>
          )}
          {!isWorkoutPending &&
            !isWorkoutError &&
            groupedSelected.length === 0 && (
              <p className={styles.emptyText}>
                この日のトレーニング記録はありません。
              </p>
            )}

          {groupedSelected.map((group) => (
            <div key={group.category.value} className={styles.detailSection}>
              <h3 className={styles.detailSectionTitle}>
                <CategoryDot color={group.category.color} />
                {group.category.label}
              </h3>
              <ul className={styles.detailItems}>
                {group.items.map(({ exercise, sets }) => (
                  <li key={exercise.id}>
                    <Link
                      to={`/record/new/${exercise.id}?date=${selectedDate}`}
                      className={styles.detailItemLink}
                    >
                      <p className={styles.detailItemName}>{exercise.name}</p>
                      <p className={styles.detailItemSets}>
                        {sets
                          .map((set) => `${set.weight}kg×${set.reps}回`)
                          .join(" / ")}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </main>

      <div className={styles.recordBar}>
        <Button size="lg" w="full" asChild>
          <Link to={`/record?date=${today}`}>
            <LuNotebookPen />
            本日のトレーニングを記録
          </Link>
        </Button>
      </div>
    </PageContainer>
  );
}
