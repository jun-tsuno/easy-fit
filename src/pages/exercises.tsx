import { ArrowLeft, Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateExercise, useExercises } from "@/hooks/use-exercises";

export function ExercisesPage() {
  const { data: exercises, isPending, isError } = useExercises();
  const createExercise = useCreateExercise();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;
    await createExercise.mutateAsync({
      name: name.trim(),
      category: category.trim() || undefined,
    });
    setName("");
    setCategory("");
  };

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col p-4">
      <header className="flex items-center gap-2 py-2">
        <Button variant="outline" size="icon" aria-label="ホームに戻る" asChild>
          <Link to="/">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">種目管理</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 py-4">
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
          <Label htmlFor="exercise-category">カテゴリ(任意)</Label>
          <Input
            id="exercise-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />
        </div>
        {createExercise.isError && (
          <p className="text-sm text-destructive">種目の登録に失敗しました。</p>
        )}
        <Button type="submit" disabled={createExercise.isPending}>
          {createExercise.isPending && <Loader2 className="animate-spin" />}
          追加する
        </Button>
      </form>

      <ul className="flex flex-col gap-2">
        {isPending && (
          <li className="flex justify-center py-6">
            <Loader2 className="animate-spin text-muted-foreground" />
          </li>
        )}
        {isError && (
          <li className="text-sm text-destructive">
            種目の取得に失敗しました。
          </li>
        )}
        {exercises?.length === 0 && !isPending && (
          <li className="py-6 text-center text-sm text-muted-foreground">
            登録された種目はありません。
          </li>
        )}
        {exercises?.map((exercise) => (
          <li key={exercise.id} className="rounded-md border border-border p-3">
            <p className="font-medium">{exercise.name}</p>
            {exercise.category && (
              <p className="text-sm text-muted-foreground">
                {exercise.category}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
