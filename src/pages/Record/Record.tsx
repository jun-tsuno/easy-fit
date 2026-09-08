import { IconButton, Spinner } from "@chakra-ui/react";
import { LuArrowLeft, LuCalendarDays, LuPlus } from "react-icons/lu";
import { Link } from "react-router";
import { CategoryDot } from "@/components/CategoryDot/CategoryDot";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { useDateParam } from "@/hooks/useDateParam";
import { useExercises } from "@/hooks/useExercises";
import { useWorkoutSetsByDate } from "@/hooks/useWorkoutSets";
import { formatDateLabel } from "@/utils/date";
import { EXERCISE_CATEGORIES } from "@/utils/exerciseCategories";
import styles from "./Record.module.css";

export function RecordListPage() {
  const [date] = useDateParam();
  const { data: exercises } = useExercises();
  const { data: workoutSets, isPending, isError } = useWorkoutSetsByDate(date);

  const grouped = EXERCISE_CATEGORIES.map((cat) => {
    const items = (exercises ?? [])
      .filter((exercise) => exercise.category === cat.value)
      .map((exercise) => ({
        exercise,
        sets: (workoutSets ?? [])
          .filter((set) => set.exerciseId === exercise.id)
          .sort((a, b) => a.setNumber - b.setNumber),
      }))
      .filter((item) => item.sets.length > 0);
    return { category: cat, items };
  }).filter((group) => group.items.length > 0);

  return (
    <PageContainer>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <IconButton variant="ghost" aria-label="ホームに戻る" asChild>
            <Link to="/">
              <LuArrowLeft />
            </Link>
          </IconButton>
          <h1 className={styles.title}>
            <LuCalendarDays />
            {formatDateLabel(date)}
          </h1>
        </div>
        <IconButton aria-label="記録を追加" asChild>
          <Link to={`/record/new?date=${date}`}>
            <LuPlus />
          </Link>
        </IconButton>
      </header>

      <div className={styles.list}>
        {isPending && (
          <div className={styles.loadingRow}>
            <Spinner color="fg.muted" />
          </div>
        )}
        {isError && <p className={styles.error}>記録の取得に失敗しました。</p>}
        {!isPending && !isError && grouped.length === 0 && (
          <p className={styles.emptyText}>
            この日のトレーニング記録はまだありません。
          </p>
        )}
        {grouped.map((group) => (
          <section key={group.category.value} className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <CategoryDot color={group.category.color} />
              {group.category.label}
            </h2>
            <ul className={styles.items}>
              {group.items.map(({ exercise, sets }) => (
                <li key={exercise.id}>
                  <Link
                    to={`/record/new/${exercise.id}?date=${date}`}
                    className={styles.itemLink}
                  >
                    <p className={styles.itemName}>{exercise.name}</p>
                    <p className={styles.itemSets}>
                      {sets
                        .map((set) => `${set.weight}kg×${set.reps}回`)
                        .join(" / ")}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PageContainer>
  );
}
