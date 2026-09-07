import { ArrowLeft, ChevronRight, Loader2, Plus } from "lucide-react";
import { Link } from "react-router";
import { CategoryDot } from "@/components/category-dot";
import { PageContainer } from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { useDateParam } from "@/hooks/use-date-param";
import { useExercises } from "@/hooks/use-exercises";
import { EXERCISE_CATEGORIES } from "@/utils/exercise-categories";

export function RecordExerciseSelectPage() {
  const [date] = useDateParam();
  const { data: exercises, isPending, isError } = useExercises();

  return (
    <PageContainer>
      <header className="flex items-center gap-2 py-2">
        <Button
          variant="outline"
          size="icon"
          aria-label="記録一覧に戻る"
          asChild
        >
          <Link to={`/record?date=${date}`}>
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">種目を選択</h1>
      </header>

      {isPending && (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      )}
      {isError && (
        <p className="py-6 text-center text-sm text-destructive">
          種目の取得に失敗しました。
        </p>
      )}

      {!isPending && !isError && (
        <div className="flex flex-col gap-8 py-4">
          {EXERCISE_CATEGORIES.map((cat) => {
            const items = (exercises ?? []).filter(
              (exercise) => exercise.category === cat.value,
            );
            const addHref = `/exercises?category=${cat.value}&from=${encodeURIComponent(
              `/record/new?date=${date}`,
            )}`;

            return (
              <section key={cat.value} className="flex flex-col gap-3">
                <h2 className="flex items-center gap-2.5 text-sm font-semibold text-muted-foreground">
                  <CategoryDot color={cat.color} />
                  {cat.label}
                </h2>
                {items.length === 0 ? (
                  <Button variant="outline" className="justify-start" asChild>
                    <Link to={addHref}>
                      <Plus />
                      種目を追加
                    </Link>
                  </Button>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {items.map((exercise) => (
                      <li key={exercise.id}>
                        <Link
                          to={`/record/new/${exercise.id}?date=${date}`}
                          className="flex items-center justify-between rounded-md border border-border p-3 transition-colors hover:bg-muted"
                        >
                          <span className="font-medium">{exercise.name}</span>
                          <ChevronRight className="size-4 text-muted-foreground" />
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
