import {
  Button,
  createListCollection,
  Dialog,
  IconButton,
  Input,
  Portal,
  Select,
  Spinner,
} from "@chakra-ui/react";
import { type FormEvent, useState } from "react";
import { LuCheck, LuDumbbell, LuPencil, LuTrash2, LuX } from "react-icons/lu";
import { useNavigate, useSearchParams } from "react-router";
import { CategoryDot } from "@/components/CategoryDot/CategoryDot";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import {
  useCreateExercise,
  useDeleteExercise,
  useExercises,
  useUpdateExercise,
} from "@/hooks/useExercises";
import type { Exercise, ExerciseCategoryValue } from "@/types/exercise";
import {
  EXERCISE_CATEGORIES,
  isExerciseCategoryValue,
} from "@/utils/exerciseCategories";
import styles from "./Exercises.module.css";

const categoryCollection = createListCollection({
  items: EXERCISE_CATEGORIES,
  itemToString: (item) => item.label,
  itemToValue: (item) => item.value,
});

function ExerciseRow({ exercise }: { exercise: Exercise }) {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(exercise.name);
  const deleteExercise = useDeleteExercise();
  const updateExercise = useUpdateExercise();

  const handleDelete = async () => {
    await deleteExercise.mutateAsync(exercise.id);
    setOpen(false);
  };

  const startEditing = () => {
    setEditName(exercise.name);
    updateExercise.reset();
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    updateExercise.reset();
  };

  const trimmedName = editName.trim();

  const handleRename = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trimmedName) return;
    if (trimmedName === exercise.name) {
      setIsEditing(false);
      return;
    }
    try {
      await updateExercise.mutateAsync({ id: exercise.id, name: trimmedName });
      setIsEditing(false);
    } catch {
      // エラー表示は updateExercise.isError で行う
    }
  };

  if (isEditing) {
    return (
      <li className={styles.row}>
        <form onSubmit={handleRename} className={styles.editForm}>
          <div className={styles.editRow}>
            <Input
              size="sm"
              aria-label="種目名"
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
              autoFocus
            />
            <IconButton
              type="submit"
              variant="ghost"
              size="sm"
              aria-label="保存"
              loading={updateExercise.isPending}
              disabled={!trimmedName}
            >
              <LuCheck />
            </IconButton>
            <IconButton
              type="button"
              variant="ghost"
              size="sm"
              colorPalette="gray"
              aria-label="キャンセル"
              disabled={updateExercise.isPending}
              onClick={cancelEditing}
            >
              <LuX />
            </IconButton>
          </div>
          {updateExercise.isError && (
            <p className={styles.error}>種目名の更新に失敗しました。</p>
          )}
        </form>
      </li>
    );
  }

  return (
    <li className={styles.row}>
      <p className={styles.rowName}>{exercise.name}</p>
      <IconButton
        variant="ghost"
        size="sm"
        aria-label={`${exercise.name}の名前を編集`}
        onClick={startEditing}
      >
        <LuPencil />
      </IconButton>
      <Dialog.Root
        role="alertdialog"
        placement="center"
        open={open}
        onOpenChange={(details) => setOpen(details.open)}
      >
        <Dialog.Trigger asChild>
          <IconButton
            variant="ghost"
            size="sm"
            colorPalette="red"
            aria-label={`${exercise.name}を削除`}
          >
            <LuTrash2 />
          </IconButton>
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner px="4">
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>種目を削除しますか?</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Dialog.Description>
                  「{exercise.name}」を削除します。この操作は取り消せません。
                </Dialog.Description>
                <p className={styles.warning}>
                  記録済みのトレーニング記録がある場合、それらの記録は過去の分も含めて集計対象から外れます。
                </p>
                {deleteExercise.isError && (
                  <p className={styles.error}>削除に失敗しました。</p>
                )}
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button
                    variant="outline"
                    colorPalette="gray"
                    disabled={deleteExercise.isPending}
                  >
                    キャンセル
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  colorPalette="red"
                  loading={deleteExercise.isPending}
                  onClick={handleDelete}
                >
                  削除する
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </li>
  );
}

export function ExercisesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialCategory = searchParams.get("category");
  // 記録フローから「種目を追加」で来た場合の戻り先
  const returnTo = searchParams.get("from");

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
    if (returnTo) navigate(returnTo);
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
      <header className={styles.header}>
        <h1 className={styles.title}>
          <LuDumbbell />
          種目管理
        </h1>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="exercise-name" className={styles.label}>
            種目名
          </label>
          <Input
            id="exercise-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>
        <div className={styles.field}>
          <Select.Root
            collection={categoryCollection}
            value={category ? [category] : []}
            onValueChange={(details) =>
              setCategory((details.value[0] as ExerciseCategoryValue) ?? "")
            }
            positioning={{ placement: "bottom-start", flip: false }}
          >
            <Select.Label className={styles.label}>カテゴリ</Select.Label>
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="カテゴリを選択" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {EXERCISE_CATEGORIES.map((cat) => (
                    <Select.Item item={cat} key={cat.value}>
                      <CategoryDot
                        color={cat.color}
                        className={styles.dotSpacing}
                      />
                      <Select.ItemText>{cat.label}</Select.ItemText>
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </div>
        {createExercise.isError && (
          <p className={styles.error}>種目の登録に失敗しました。</p>
        )}
        <Button
          type="submit"
          mt="2"
          loading={createExercise.isPending}
          disabled={!name.trim() || !category}
        >
          追加する
        </Button>
      </form>

      <div className={styles.list}>
        {isPending && (
          <div className={styles.loadingRow}>
            <Spinner color="fg.muted" />
          </div>
        )}
        {isError && <p className={styles.error}>種目の取得に失敗しました。</p>}
        {!isPending && !isError && (exercises?.length ?? 0) === 0 && (
          <p className={styles.emptyText}>登録された種目はありません。</p>
        )}
        {grouped.map((group) => (
          <section key={group.category.value} className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <CategoryDot color={group.category.color} />
              {group.category.label}
            </h2>
            <ul className={styles.items}>
              {group.items.map((exercise) => (
                <ExerciseRow key={exercise.id} exercise={exercise} />
              ))}
            </ul>
          </section>
        ))}
        {uncategorized.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>未分類</h2>
            <ul className={styles.items}>
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
