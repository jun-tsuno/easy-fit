import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Link } from "react-router";
import { PageContainer } from "@/components/page-container";
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
  useBodyWeightByDate,
  useSaveBodyWeight,
} from "@/hooks/use-body-weight";
import { useExercises } from "@/hooks/use-exercises";
import {
  useCreateWorkoutSet,
  useDeleteWorkoutSet,
  useWorkoutSetsByDate,
} from "@/hooks/use-workout-sets";
import { getTodayDateString } from "@/utils/date";

export function RecordPage() {
  const [date, setDate] = useState(getTodayDateString());

  const { data: exercises } = useExercises();
  const { data: workoutSets, isPending: isSetsPending } =
    useWorkoutSetsByDate(date);
  const createWorkoutSet = useCreateWorkoutSet();
  const deleteWorkoutSet = useDeleteWorkoutSet(date);

  const { data: bodyWeight, isPending: isBodyWeightPending } =
    useBodyWeightByDate(date);
  const saveBodyWeight = useSaveBodyWeight(date);
  const [weightInput, setWeightInput] = useState("");

  useEffect(() => {
    setWeightInput(bodyWeight ? String(bodyWeight.weight) : "");
  }, [bodyWeight]);

  const [exerciseId, setExerciseId] = useState("");
  const [setWeight, setSetWeight] = useState("");
  const [reps, setReps] = useState("");

  const handleSaveBodyWeight = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!weightInput) return;
    await saveBodyWeight.mutateAsync({
      id: bodyWeight?.id ?? null,
      weight: Number(weightInput),
    });
  };

  const handleAddSet = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!exerciseId || !setWeight || !reps) return;
    const nextSetNumber =
      (workoutSets ?? []).filter((set) => set.exerciseId === exerciseId)
        .length + 1;
    await createWorkoutSet.mutateAsync({
      date,
      exerciseId,
      weight: Number(setWeight),
      reps: Number(reps),
      setNumber: nextSetNumber,
    });
    setSetWeight("");
    setReps("");
  };

  const exerciseName = (id: string) =>
    exercises?.find((exercise) => exercise.id === id)?.name ?? "不明な種目";

  const groupedSets = Array.from(
    new Set((workoutSets ?? []).map((set) => set.exerciseId)),
  ).map((id) => ({
    exerciseId: id,
    name: exerciseName(id),
    sets: (workoutSets ?? [])
      .filter((set) => set.exerciseId === id)
      .sort((a, b) => a.setNumber - b.setNumber),
  }));

  return (
    <PageContainer>
      <header className="flex items-center gap-2 py-2">
        <Button variant="outline" size="icon" aria-label="ホームに戻る" asChild>
          <Link to="/">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">記録</h1>
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

      <form
        onSubmit={handleSaveBodyWeight}
        className="flex flex-col gap-2 border-t border-border py-6"
      >
        <Label htmlFor="body-weight">体重 (kg)</Label>
        <div className="flex gap-2">
          <Input
            id="body-weight"
            type="number"
            step="0.1"
            inputMode="decimal"
            value={weightInput}
            onChange={(event) => setWeightInput(event.target.value)}
            disabled={isBodyWeightPending}
          />
          <Button
            type="submit"
            disabled={saveBodyWeight.isPending || !weightInput}
          >
            {saveBodyWeight.isPending && <Loader2 className="animate-spin" />}
            保存
          </Button>
        </div>
        {saveBodyWeight.isError && (
          <p className="text-sm text-destructive">体重の保存に失敗しました。</p>
        )}
      </form>

      <form
        onSubmit={handleAddSet}
        className="flex flex-col gap-3 border-t border-border py-6"
      >
        <h2 className="text-sm font-semibold text-muted-foreground">
          トレーニング記録を追加
        </h2>
        <div className="flex flex-col gap-2">
          <Label htmlFor="set-exercise">種目</Label>
          <Select value={exerciseId} onValueChange={setExerciseId}>
            <SelectTrigger id="set-exercise">
              <SelectValue placeholder="種目を選択" />
            </SelectTrigger>
            <SelectContent>
              {exercises?.map((exercise) => (
                <SelectItem key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="set-weight">重量 (kg)</Label>
            <Input
              id="set-weight"
              type="number"
              step="0.5"
              inputMode="decimal"
              value={setWeight}
              onChange={(event) => setSetWeight(event.target.value)}
            />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="set-reps">Rep数</Label>
            <Input
              id="set-reps"
              type="number"
              inputMode="numeric"
              value={reps}
              onChange={(event) => setReps(event.target.value)}
            />
          </div>
        </div>
        {createWorkoutSet.isError && (
          <p className="text-sm text-destructive">記録の追加に失敗しました。</p>
        )}
        <Button
          type="submit"
          disabled={
            createWorkoutSet.isPending || !exerciseId || !setWeight || !reps
          }
        >
          {createWorkoutSet.isPending && <Loader2 className="animate-spin" />}
          セットを追加
        </Button>
      </form>

      <div className="flex flex-col gap-6 border-t border-border pt-6">
        {isSetsPending && (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        )}
        {!isSetsPending && groupedSets.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            この日の記録はまだありません。
          </p>
        )}
        {groupedSets.map((group) => (
          <section key={group.exerciseId} className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">{group.name}</h3>
            <ul className="flex flex-col gap-2">
              {group.sets.map((set) => (
                <li
                  key={set.id}
                  className="flex items-center gap-3 rounded-md border border-border p-3"
                >
                  <span className="text-sm text-muted-foreground">
                    {set.setNumber}セット目
                  </span>
                  <span className="flex-1 font-medium">
                    {set.weight}kg × {set.reps}回
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="削除"
                    onClick={() => deleteWorkoutSet.mutate(set.id)}
                  >
                    <Trash2 className="text-muted-foreground" />
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PageContainer>
  );
}
