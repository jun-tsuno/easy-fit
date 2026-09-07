import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CategoryDot } from "@/components/category-dot";
import { PageContainer } from "@/components/page-container";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateExercise,
  useDeleteExercise,
  useExercises,
} from "@/hooks/use-exercises";
import type { Exercise, ExerciseCategoryValue } from "@/types/exercise";
import {
  EXERCISE_CATEGORIES,
  getExerciseCategory,
  isExerciseCategoryValue,
} from "@/utils/exercise-categories";

function ExerciseRow({ exercise }: { exercise: Exercise }) {
  const [open, setOpen] = useState(false);
  const deleteExercise = useDeleteExercise();
  const category = getExerciseCategory(exercise.category);

  const handleDelete = async () => {
    await deleteExercise.mutateAsync(exercise.id);
    setOpen(false);
  };

  return (
    <li
      className="flex items-center gap-3 rounded-md border border-border border-l-4 p-3"
      style={{ borderLeftColor: category.color }}
    >
      <p className="flex-1 font-medium">{exercise.name}</p>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`${exercise.name}を削除`}
          >
            <Trash2 className="text-muted-foreground" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>種目を削除しますか?</AlertDialogTitle>
            <AlertDialogDescription>
              「{exercise.name}」を削除します。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteExercise.isError && (
            <p className="text-sm text-destructive">削除に失敗しました。</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteExercise.isPending}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
              disabled={deleteExercise.isPending}
            >
              {deleteExercise.isPending && <Loader2 className="animate-spin" />}
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}

export function ExercisesPage() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category");
  const backTo = searchParams.get("from") ?? "/";

  const { data: exercises, isPending, isError } = useExercises();
  const createExercise = useCreateExercise();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ExerciseCategoryValue | "">(
    initialCategory && isExerciseCategoryValue(initialCategory)
      ? initialCategory
      : "",
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !category) return;
    await createExercise.mutateAsync({ name: name.trim(), category });
    setName("");
    setCategory("");
  };

  const grouped = EXERCISE_CATEGORIES.map((cat) => ({
    category: cat,
    items: (exercises ?? []).filter(
      (exercise) =>
        isExerciseCategoryValue(exercise.category ?? "") &&
        exercise.category === cat.value,
    ),
  })).filter((group) => group.items.length > 0);

  const uncategorized = (exercises ?? []).filter(
    (exercise) => !isExerciseCategoryValue(exercise.category ?? ""),
  );

  return (
    <PageContainer>
      <header className="flex items-center gap-2 py-2">
        <Button variant="outline" size="icon" aria-label="戻る" asChild>
          <Link to={backTo}>
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">種目管理</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="exercise-name">種目名</Label>
          <Input
            id="exercise-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="exercise-category">カテゴリ</Label>
          <Select
            value={category}
            onValueChange={(value) =>
              setCategory(value as ExerciseCategoryValue)
            }
          >
            <SelectTrigger id="exercise-category">
              <SelectValue placeholder="カテゴリを選択" />
            </SelectTrigger>
            <SelectContent>
              {EXERCISE_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  <CategoryDot color={cat.color} className="mr-3" />
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {createExercise.isError && (
          <p className="text-sm text-destructive">種目の登録に失敗しました。</p>
        )}
        <Button
          type="submit"
          className="mt-2"
          disabled={createExercise.isPending || !name.trim() || !category}
        >
          {createExercise.isPending && <Loader2 className="animate-spin" />}
          追加する
        </Button>
      </form>

      <div className="mt-4 flex flex-col gap-8 border-t border-border pt-8">
        {isPending && (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        )}
        {isError && (
          <p className="text-sm text-destructive">種目の取得に失敗しました。</p>
        )}
        {!isPending && !isError && (exercises?.length ?? 0) === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            登録された種目はありません。
          </p>
        )}
        {grouped.map((group) => (
          <section key={group.category.value} className="flex flex-col gap-3">
            <h2 className="flex items-center gap-2.5 text-sm font-semibold text-muted-foreground">
              <CategoryDot color={group.category.color} />
              {group.category.label}
            </h2>
            <ul className="flex flex-col gap-2">
              {group.items.map((exercise) => (
                <ExerciseRow key={exercise.id} exercise={exercise} />
              ))}
            </ul>
          </section>
        ))}
        {uncategorized.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-muted-foreground">
              未分類
            </h2>
            <ul className="flex flex-col gap-2">
              {uncategorized.map((exercise) => (
                <ExerciseRow key={exercise.id} exercise={exercise} />
              ))}
            </ul>
          </section>
        )}
      </div>
    </PageContainer>
  );
}
