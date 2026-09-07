import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { Link } from "react-router";
import { CategoryDot } from "@/components/category-dot";
import { PageContainer } from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDateParam } from "@/hooks/use-date-param";
import { useExercises } from "@/hooks/use-exercises";
import { useWorkoutSetsByDate } from "@/hooks/use-workout-sets";
import { EXERCISE_CATEGORIES } from "@/utils/exercise-categories";

export function RecordListPage() {
  const [date, setDate] = useDateParam();
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
      <header className="flex items-center justify-between gap-2 py-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="ホームに戻る"
            asChild
          >
            <Link to="/">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">トレーニング記録</h1>
        </div>
        <Button size="icon" aria-label="記録を追加" asChild>
          <Link to={`/record/new?date=${date}`}>
            <Plus />
          </Link>
        </Button>
      </header>

      <div className="flex flex-col gap-2 py-4">
        <Label htmlFor="record-date">日付</Label>
        <Input
          id="record-date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-8 border-t border-border pt-6">
        {isPending && (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        )}
        {isError && (
          <p className="text-sm text-destructive">記録の取得に失敗しました。</p>
        )}
        {!isPending && !isError && grouped.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            この日のトレーニング記録はまだありません。
          </p>
        )}
        {grouped.map((group) => (
          <section key={group.category.value} className="flex flex-col gap-4">
            <h2 className="flex items-center gap-2.5 text-sm font-semibold text-muted-foreground">
              <CategoryDot color={group.category.color} />
              {group.category.label}
            </h2>
            <ul className="flex flex-col gap-3">
              {group.items.map(({ exercise, sets }) => (
                <li key={exercise.id}>
                  <Link
                    to={`/record/new/${exercise.id}?date=${date}`}
                    className="block rounded-md border border-border p-3 transition-colors hover:bg-muted"
                  >
                    <p className="font-medium">{exercise.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
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
