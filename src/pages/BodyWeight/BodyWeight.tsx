import { Button, IconButton, Input } from "@chakra-ui/react";
import { type FormEvent, useEffect, useState } from "react";
import { LuArrowLeft, LuScale } from "react-icons/lu";
import { Link } from "react-router";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { toaster } from "@/components/Toaster/Toaster";
import { useBodyWeightByDate, useSaveBodyWeight } from "@/hooks/useBodyWeight";
import { useDateParam } from "@/hooks/useDateParam";
import styles from "./BodyWeight.module.css";

export function BodyWeightPage() {
  const [date, setDate] = useDateParam();
  const { data: bodyWeight, isPending } = useBodyWeightByDate(date);
  const saveBodyWeight = useSaveBodyWeight(date);
  const [weightInput, setWeightInput] = useState("");

  useEffect(() => {
    setWeightInput(bodyWeight ? String(bodyWeight.weight) : "");
  }, [bodyWeight]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!weightInput) return;
    try {
      await saveBodyWeight.mutateAsync({
        id: bodyWeight?.id ?? null,
        weight: Number(weightInput),
      });
      toaster.create({ title: "体重を記録しました", type: "success" });
    } catch {
      toaster.create({ title: "体重の保存に失敗しました。", type: "error" });
    }
  };

  return (
    <PageContainer>
      <header className={styles.header}>
        <IconButton variant="ghost" aria-label="ホームに戻る" asChild>
          <Link to="/">
            <LuArrowLeft />
          </Link>
        </IconButton>
        <h1 className={styles.title}>
          <LuScale />
          体重記録
        </h1>
      </header>

      <div className={styles.dateField}>
        <label htmlFor="body-weight-date" className={styles.label}>
          日付
        </label>
        <Input
          id="body-weight-date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="body-weight" className={styles.label}>
          体重 (kg)
        </label>
        <div className={styles.inputRow}>
          <Input
            id="body-weight"
            type="number"
            step="0.1"
            inputMode="decimal"
            value={weightInput}
            onChange={(event) => setWeightInput(event.target.value)}
            disabled={isPending}
          />
          <Button
            type="submit"
            loading={saveBodyWeight.isPending}
            disabled={!weightInput}
          >
            保存
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
