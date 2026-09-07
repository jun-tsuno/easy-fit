import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { PageContainer } from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDateParam } from "@/hooks/use-date-param";
import { useExercises } from "@/hooks/use-exercises";
import {
  useCreateWorkoutSet,
  useDeleteWorkoutSet,
  useUpdateWorkoutSet,
  useWorkoutSetsByExercise,
} from "@/hooks/use-workout-sets";

type SetRow = {
  key: string;
  id: string | null;
  weight: string;
  reps: string;
  setNumber: number;
};

const underlineInputClassName =
  "rounded-none border-0 border-b border-input bg-transparent px-0 text-center shadow-none focus-visible:ring-0";

export function RecordSetInputPage() {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const [date] = useDateParam();
  const { data: exercises } = useExercises();
  const exercise = exercises?.find((item) => item.id === exerciseId);

  const { data, isError } = useWorkoutSetsByExercise(date, exerciseId ?? "");
  const createWorkoutSet = useCreateWorkoutSet();
  const updateWorkoutSet = useUpdateWorkoutSet();
  const deleteWorkoutSet = useDeleteWorkoutSet(date);

  const [rows, setRows] = useState<SetRow[] | null>(null);

  useEffect(() => {
    if (rows !== null || data === undefined) return;
    setRows(
      data.length > 0
        ? data
            .slice()
            .sort((a, b) => a.setNumber - b.setNumber)
            .map((set) => ({
              key: set.id,
              id: set.id,
              weight: String(set.weight),
              reps: String(set.reps),
              setNumber: set.setNumber,
            }))
        : [{ key: "draft-1", id: null, weight: "", reps: "", setNumber: 1 }],
    );
  }, [data, rows]);

  if (!exerciseId) return null;

  const updateRowField = (
    key: string,
    field: "weight" | "reps",
    value: string,
  ) => {
    setRows((prev) =>
      (prev ?? []).map((row) =>
        row.key === key ? { ...row, [field]: value } : row,
      ),
    );
  };

  const handleAddRow = () => {
    setRows((prev) => {
      const next = prev ?? [];
      return [
        ...next,
        {
          key: `draft-${next.length}-${Date.now()}`,
          id: null,
          weight: "",
          reps: "",
          setNumber: next.length + 1,
        },
      ];
    });
  };

  const handleDeleteRow = async (row: SetRow) => {
    try {
      if (row.id) {
        await deleteWorkoutSet.mutateAsync(row.id);
      }
      setRows((prev) => (prev ?? []).filter((item) => item.key !== row.key));
    } catch {
      toast.error("削除に失敗しました。");
    }
  };

  const handleRowBlur = async (row: SetRow) => {
    if (!row.weight || !row.reps) return;
    const weight = Number(row.weight);
    const reps = Number(row.reps);
    if (Number.isNaN(weight) || Number.isNaN(reps)) return;

    try {
      if (row.id) {
        await updateWorkoutSet.mutateAsync({ id: row.id, date, weight, reps });
        return;
      }

      const created = await createWorkoutSet.mutateAsync({
        date,
        exerciseId,
        weight,
        reps,
        setNumber: row.setNumber,
      });
      if (created) {
        setRows((prev) =>
          (prev ?? []).map((item) =>
            item.key === row.key ? { ...item, id: created.id } : item,
          ),
        );
        toast.success(`${row.setNumber}セット目を記録しました`);
      }
    } catch {
      toast.error("記録の保存に失敗しました。");
    }
  };

  return (
    <PageContainer>
      <header className="flex items-center gap-2 py-2">
        <Button
          variant="outline"
          size="icon"
          aria-label="種目選択に戻る"
          asChild
        >
          <Link to={`/record/new?date=${date}`}>
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">{exercise?.name ?? "記録"}</h1>
      </header>

      <div className="flex flex-col gap-4 py-6">
        {isError && (
          <p className="py-6 text-center text-sm text-destructive">
            記録の取得に失敗しました。
          </p>
        )}
        {!isError && rows === null && (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        )}
        {!isError &&
          rows !== null &&
          rows.map((row) => (
            <div key={row.key} className="flex items-center gap-3">
              <span className="w-5 shrink-0 text-sm text-muted-foreground">
                {row.setNumber}
              </span>
              <div className="flex flex-1 items-center gap-2">
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  placeholder="重量"
                  value={row.weight}
                  onChange={(event) =>
                    updateRowField(row.key, "weight", event.target.value)
                  }
                  onBlur={() => handleRowBlur(row)}
                  className={underlineInputClassName}
                />
                <span className="shrink-0 text-sm text-muted-foreground">
                  kg
                </span>
              </div>
              <span className="shrink-0 text-muted-foreground">×</span>
              <div className="flex flex-1 items-center gap-2">
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="回数"
                  value={row.reps}
                  onChange={(event) =>
                    updateRowField(row.key, "reps", event.target.value)
                  }
                  onBlur={() => handleRowBlur(row)}
                  className={underlineInputClassName}
                />
                <span className="shrink-0 text-sm text-muted-foreground">
                  回
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="セットを削除"
                onClick={() => handleDeleteRow(row)}
              >
                <Trash2 className="text-muted-foreground" />
              </Button>
            </div>
          ))}

        {!isError && rows !== null && (
          <Button variant="outline" onClick={handleAddRow} className="mt-2">
            <Plus />
            セットを追加
          </Button>
        )}
      </div>
    </PageContainer>
  );
}
