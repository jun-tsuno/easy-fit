import { Button, IconButton, Input, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuArrowLeft, LuPlus, LuTrash2 } from "react-icons/lu";
import { Link, useParams } from "react-router";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { toaster } from "@/components/Toaster/Toaster";
import { useDateParam } from "@/hooks/useDateParam";
import { useExercises } from "@/hooks/useExercises";
import {
  useCreateWorkoutSet,
  useDeleteWorkoutSet,
  useUpdateWorkoutSet,
  useWorkoutSetsByExercise,
} from "@/hooks/useWorkoutSets";
import styles from "./RecordSetInput.module.css";

type SetRow = {
  key: string;
  id: string | null;
  weight: string;
  reps: string;
  setNumber: number;
};

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
      toaster.create({ title: "削除に失敗しました。", type: "error" });
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
        toaster.create({
          title: `${row.setNumber}セット目を記録しました`,
          type: "success",
        });
      }
    } catch {
      toaster.create({ title: "記録の保存に失敗しました。", type: "error" });
    }
  };

  return (
    <PageContainer>
      <header className={styles.header}>
        <IconButton variant="outline" aria-label="種目選択に戻る" asChild>
          <Link to={`/record/new?date=${date}`}>
            <LuArrowLeft />
          </Link>
        </IconButton>
        <h1 className={styles.title}>{exercise?.name ?? "記録"}</h1>
      </header>

      <div className={styles.body}>
        {isError && <p className={styles.error}>記録の取得に失敗しました。</p>}
        {!isError && rows === null && (
          <div className={styles.loadingRow}>
            <Spinner color="fg.muted" />
          </div>
        )}
        {!isError &&
          rows !== null &&
          rows.map((row) => (
            <div key={row.key} className={styles.row}>
              <span className={styles.setNumber}>{row.setNumber}</span>
              <div className={styles.inputGroup}>
                <Input
                  variant="flushed"
                  textAlign="center"
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  placeholder="重量"
                  value={row.weight}
                  onChange={(event) =>
                    updateRowField(row.key, "weight", event.target.value)
                  }
                  onBlur={() => handleRowBlur(row)}
                />
                <span className={styles.unit}>kg</span>
              </div>
              <span className={styles.times}>×</span>
              <div className={styles.inputGroup}>
                <Input
                  variant="flushed"
                  textAlign="center"
                  type="number"
                  inputMode="numeric"
                  placeholder="回数"
                  value={row.reps}
                  onChange={(event) =>
                    updateRowField(row.key, "reps", event.target.value)
                  }
                  onBlur={() => handleRowBlur(row)}
                />
                <span className={styles.unit}>回</span>
              </div>
              <IconButton
                variant="ghost"
                size="sm"
                aria-label="セットを削除"
                onClick={() => handleDeleteRow(row)}
              >
                <LuTrash2 />
              </IconButton>
            </div>
          ))}

        {!isError && rows !== null && (
          <Button
            variant="outline"
            onClick={handleAddRow}
            className={styles.addButton}
          >
            <LuPlus />
            セットを追加
          </Button>
        )}
      </div>
    </PageContainer>
  );
}
