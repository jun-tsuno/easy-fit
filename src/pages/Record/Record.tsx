import { IconButton, Input, Spinner } from "@chakra-ui/react";
import { LuArrowLeft, LuPlus } from "react-icons/lu";
import { Link } from "react-router";
import { CategoryDot } from "@/components/CategoryDot/CategoryDot";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { useDateParam } from "@/hooks/useDateParam";
import { useExercises } from "@/hooks/useExercises";
import { useWorkoutSetsByDate } from "@/hooks/useWorkoutSets";
import { EXERCISE_CATEGORIES } from "@/utils/exerciseCategories";
import styles from "./Record.module.css";

export function RecordListPage() {
  const [date, setDate] = useDateParam();
  const { data: exercises } = useExercises();
  const { data: workoutSets, isPending, isError } = useWorkoutSetsByDate(date);

  const knownExerciseIds = new Set(
    (exercises ?? []).map((exercise) => exercise.id),
  );

  const grouped = EXERCISE_CATEGORIES.map((cat) => {
    const items = (exercises ?? [])
      .filter((exercise) => exercise.category === cat.value)
      .map((exercise) => ({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: (workoutSets ?? [])
          .filter((set) => set.exerciseId === exercise.id)
          .sort((a, b) => a.setNumber - b.setNumber),
      }))
      .filter((item) => item.sets.length > 0);
    return { category: cat, isUnassigned: false, items };
  }).filter((group) => group.items.length > 0);

  const orphanedExerciseIds = Array.from(
    new Set(
      (workoutSets ?? [])
        .filter((set) => !knownExerciseIds.has(set.exerciseId))
        .map((set) => set.exerciseId),
    ),
  );

  const unassignedGroup = {
    category: {
      value: "unassigned",
      label: "未設定",
      color: "oklch(0.55 0 0)",
    },
    isUnassigned: true,
    items: orphanedExerciseIds.map((exerciseId) => ({
      exerciseId,
      exerciseName: "未設定の種目",
      sets: (workoutSets ?? [])
        .filter((set) => set.exerciseId === exerciseId)
        .sort((a, b) => a.setNumber - b.setNumber),
    })),
  };

  const allGroups =
    unassignedGroup.items.length > 0 ? [...grouped, unassignedGroup] : grouped;

  return (
    <PageContainer>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <IconButton variant="ghost" aria-label="ホームに戻る" asChild>
            <Link to="/">
              <LuArrowLeft />
            </Link>
          </IconButton>
          <h1 className={styles.title}>トレーニング記録</h1>
        </div>
        <IconButton aria-label="記録を追加" asChild>
          <Link to={`/record/new?date=${date}`}>
            <LuPlus />
          </Link>
        </IconButton>
      </header>

      <div className={styles.dateField}>
        <label htmlFor="record-date" className={styles.dateLabel}>
          日付
        </label>
        <Input
          id="record-date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </div>

      <div className={styles.list}>
        {isPending && (
          <div className={styles.loadingRow}>
            <Spinner color="fg.muted" />
          </div>
        )}
        {isError && <p className={styles.error}>記録の取得に失敗しました。</p>}
        {!isPending && !isError && allGroups.length === 0 && (
          <p className={styles.emptyText}>
            この日のトレーニング記録はまだありません。
          </p>
        )}
        {allGroups.map((group) => (
          <section key={group.category.value} className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <CategoryDot color={group.category.color} />
              {group.category.label}
            </h2>
            <ul className={styles.items}>
              {group.items.map(({ exerciseId, exerciseName, sets }) =>
                group.isUnassigned ? (
                  <li key={exerciseId}>
                    <div className={styles.itemStatic}>
                      <p className={styles.itemName}>{exerciseName}</p>
                      <p className={styles.itemSets}>
                        {sets
                          .map((set) => `${set.weight}kg×${set.reps}回`)
                          .join(" / ")}
                      </p>
                    </div>
                  </li>
                ) : (
                  <li key={exerciseId}>
                    <Link
                      to={`/record/new/${exerciseId}?date=${date}`}
                      className={styles.itemLink}
                    >
                      <p className={styles.itemName}>{exerciseName}</p>
                      <p className={styles.itemSets}>
                        {sets
                          .map((set) => `${set.weight}kg×${set.reps}回`)
                          .join(" / ")}
                      </p>
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </section>
        ))}
      </div>
    </PageContainer>
  );
}
