import { Button, IconButton, Input, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuArrowLeft, LuPlus, LuTrash2 } from "react-icons/lu";
import { Link, useNavigate, useParams } from "react-router";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { toaster } from "@/components/Toaster/Toaster";
import { useDateParam } from "@/hooks/useDateParam";
import { useExercises } from "@/hooks/useExercises";
import {
  useSaveExerciseSets,
  useWorkoutSetsByExercise,
} from "@/hooks/useWorkoutSets";
import styles from "./RecordSetInput.module.css";

type SetRow = {
  key: string;
  id: string | null;
  weight: string;
  reps: string;
};

let draftCounter = 0;
function makeDraftRow(): SetRow {
  draftCounter += 1;
  return { key: `draft-${draftCounter}`, id: null, weight: "", reps: "" };
}

export function RecordSetInputPage() {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const [date] = useDateParam();
  const navigate = useNavigate();
  const { data: exercises } = useExercises();
  const exercise = exercises?.find((item) => item.id === exerciseId);

  const { data, isError } = useWorkoutSetsByExercise(date, exerciseId ?? "");
  const saveSets = useSaveExerciseSets(date, exerciseId ?? "");

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
            }))
        : [makeDraftRow()],
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
    setRows((prev) => [...(prev ?? []), makeDraftRow()]);
  };

  const handleDeleteRow = (key: string) => {
    setRows((prev) => (prev ?? []).filter((row) => row.key !== key));
  };

  const handleSave = async () => {
    if (rows === null) return;

    const filled = rows.filter((row) => row.weight !== "" || row.reps !== "");
    const parsed = filled.map((row) => ({
      id: row.id,
      weight: Number(row.weight),
      reps: Number(row.reps),
    }));
    const hasInvalid = parsed.some(
      (row) =>
        !Number.isFinite(row.weight) ||
        row.weight <= 0 ||
        !Number.isInteger(row.reps) ||
        row.reps <= 0,
    );
    if (hasInvalid) {
      toaster.create({
        title: "各セットの重量と回数を入力してください",
        type: "error",
      });
      return;
    }

    const keptIds = new Set(
      parsed.map((row) => row.id).filter((id): id is string => id !== null),
    );
    const deletedIds = (data ?? [])
      .map((set) => set.id)
      .filter((id) => !keptIds.has(id));

    if (parsed.length === 0 && deletedIds.length === 0) {
      navigate(`/record?date=${date}`);
      return;
    }

    try {
      await saveSets.mutateAsync({
        sets: parsed.map((row, index) => ({ ...row, setNumber: index + 1 })),
        deletedIds,
      });
      toaster.create({ title: "記録を保存しました", type: "success" });
      navigate(`/record?date=${date}`);
    } catch {
      toaster.create({ title: "記録の保存に失敗しました。", type: "error" });
    }
  };

  return (
    <PageContainer>
      <header className={styles.header}>
        <IconButton variant="ghost" aria-label="種目選択に戻る" asChild>
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
          rows.map((row, index) => (
            <div key={row.key} className={styles.row}>
              <span className={styles.setNumber}>{index + 1}</span>
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
                />
                <span className={styles.unit}>回</span>
              </div>
              <IconButton
                variant="ghost"
                size="sm"
                colorPalette="red"
                aria-label="セットを削除"
                onClick={() => handleDeleteRow(row.key)}
              >
                <LuTrash2 />
              </IconButton>
            </div>
          ))}

        {!isError && rows !== null && (
          <div className={styles.actions}>
            <Button
              variant="outline"
              onClick={handleAddRow}
              disabled={saveSets.isPending}
            >
              <LuPlus />
              セットを追加
            </Button>
            <Button onClick={handleSave} loading={saveSets.isPending}>
              保存
            </Button>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
