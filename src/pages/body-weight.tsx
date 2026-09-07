import { ArrowLeft, Loader2 } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { PageContainer } from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useBodyWeightByDate,
  useSaveBodyWeight,
} from "@/hooks/use-body-weight";
import { useDateParam } from "@/hooks/use-date-param";

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
      toast.success("体重を記録しました");
    } catch {
      toast.error("体重の保存に失敗しました。");
    }
  };

  return (
    <PageContainer>
      <header className="flex items-center gap-2 py-2">
        <Button variant="outline" size="icon" aria-label="ホームに戻る" asChild>
          <Link to="/">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">体重記録</h1>
      </header>

      <div className="flex flex-col gap-2 py-4">
        <Label htmlFor="body-weight-date">日付</Label>
        <Input
          id="body-weight-date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 py-4">
        <Label htmlFor="body-weight">体重 (kg)</Label>
        <div className="flex gap-2">
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
            disabled={saveBodyWeight.isPending || !weightInput}
          >
            {saveBodyWeight.isPending && <Loader2 className="animate-spin" />}
            保存
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
