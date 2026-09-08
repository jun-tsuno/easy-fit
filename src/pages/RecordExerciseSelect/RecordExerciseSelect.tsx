import { Button, IconButton, Spinner } from "@chakra-ui/react";
import { LuArrowLeft, LuChevronRight, LuPlus } from "react-icons/lu";
import { Link } from "react-router";
import { CategoryDot } from "@/components/CategoryDot/CategoryDot";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { useDateParam } from "@/hooks/useDateParam";
import { useExercises } from "@/hooks/useExercises";
import { EXERCISE_CATEGORIES } from "@/utils/exerciseCategories";
import styles from "./RecordExerciseSelect.module.css";

export function RecordExerciseSelectPage() {
  const [date] = useDateParam();
  const { data: exercises, isPending, isError } = useExercises();

  return (
    <PageContainer>
      <header className={styles.header}>
        <IconButton variant="ghost" aria-label="記録一覧に戻る" asChild>
          <Link to={`/record?date=${date}`}>
            <LuArrowLeft />
          </Link>
        </IconButton>
        <h1 className={styles.title}>種目を選択</h1>
      </header>

      {isPending && (
        <div className={styles.loadingRow}>
          <Spinner color="fg.muted" />
        </div>
      )}
      {isError && <p className={styles.error}>種目の取得に失敗しました。</p>}

      {!isPending && !isError && (
        <div className={styles.list}>
          {EXERCISE_CATEGORIES.map((cat) => {
            const items = (exercises ?? []).filter(
              (exercise) => exercise.category === cat.value,
            );
            const addHref = `/exercises?category=${cat.value}&from=${encodeURIComponent(
              `/record/new?date=${date}`,
            )}`;

            return (
              <section key={cat.value} className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <CategoryDot color={cat.color} />
                  {cat.label}
                </h2>
                {items.length === 0 ? (
                  <Button variant="outline" justifyContent="flex-start" asChild>
                    <Link to={addHref}>
                      <LuPlus />
                      種目を追加
                    </Link>
                  </Button>
                ) : (
                  <ul className={styles.items}>
                    {items.map((exercise) => (
                      <li key={exercise.id}>
                        <Link
                          to={`/record/new/${exercise.id}?date=${date}`}
                          className={styles.itemLink}
                        >
                          <span className={styles.itemName}>
                            {exercise.name}
                          </span>
                          <LuChevronRight className={styles.itemChevron} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
