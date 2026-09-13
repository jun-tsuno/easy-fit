import { Button, IconButton, Input, Spinner } from "@chakra-ui/react";
import { type FormEvent, useMemo, useState } from "react";
import {
  LuCalendarCheck,
  LuCheck,
  LuChevronLeft,
  LuChevronRight,
  LuLogOut,
  LuPencil,
  LuUser,
  LuX,
} from "react-icons/lu";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { useWorkoutSetsInRange } from "@/hooks/useWorkoutSets";
import { useAuth } from "@/providers/AuthProvider";
import { addMonths, formatMonthLabel, getMonthRange } from "@/utils/date";
import styles from "./MyPage.module.css";

const NICKNAME_MAX_LENGTH = 10;

function NicknameField({
  nickname,
  onSave,
}: {
  nickname: string | null;
  onSave: (nickname: string) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(nickname ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEditing = () => {
    setValue(nickname ?? "");
    setError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setError(null);
  };

  const trimmed = value.trim();
  const isEmpty = trimmed.length === 0;
  const isTooLong = trimmed.length > NICKNAME_MAX_LENGTH;
  const canSubmit = !isEmpty && !isTooLong;
  const isUnchanged = trimmed === (nickname ?? "").trim();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    if (isUnchanged) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await onSave(trimmed);
      setIsEditing(false);
    } catch {
      setError("ニックネームの更新に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <form
        onSubmit={handleSubmit}
        noValidate
        className={styles.nicknameFormWrap}
      >
        <div className={styles.nicknameForm}>
          <div className={styles.nicknameInputGroup}>
            <Input
              size="sm"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              autoFocus
            />
            <p className={isTooLong ? styles.error : styles.hint}>
              10文字以内で入力してください
            </p>
          </div>
          <IconButton
            type="submit"
            variant="ghost"
            size="sm"
            aria-label="保存"
            loading={isSaving}
            disabled={!canSubmit}
          >
            <LuCheck />
          </IconButton>
          <IconButton
            type="button"
            variant="ghost"
            size="sm"
            aria-label="キャンセル"
            disabled={isSaving}
            onClick={cancelEditing}
          >
            <LuX />
          </IconButton>
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </form>
    );
  }

  return (
    <div className={styles.nicknameRow}>
      <p className={styles.username}>
        {nickname ? `${nickname}さん` : "ニックネーム未設定"}
      </p>
      <IconButton
        variant="ghost"
        size="sm"
        aria-label="ニックネームを編集"
        onClick={startEditing}
      >
        <LuPencil />
      </IconButton>
    </div>
  );
}

export function MyPagePage() {
  const { user, signOut, updateNickname } = useAuth();

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  const { start, end } = useMemo(
    () => getMonthRange(visibleMonth.year, visibleMonth.month),
    [visibleMonth],
  );

  const { data: workoutSets, isPending } = useWorkoutSetsInRange(start, end);

  const trainingDays = useMemo(
    () => new Set((workoutSets ?? []).map((set) => set.date)).size,
    [workoutSets],
  );

  const goToMonth = (delta: number) => {
    setVisibleMonth((current) => addMonths(current.year, current.month, delta));
  };

  return (
    <PageContainer>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <LuUser />
          マイページ
        </h1>
      </header>

      {user && (
        <NicknameField nickname={user.nickname} onSave={updateNickname} />
      )}

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="前の月"
            onClick={() => goToMonth(-1)}
          >
            <LuChevronLeft />
          </IconButton>
          <span className={styles.monthLabel}>
            {formatMonthLabel(visibleMonth.year, visibleMonth.month)}
          </span>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="次の月"
            onClick={() => goToMonth(1)}
          >
            <LuChevronRight />
          </IconButton>
        </div>

        <div className={styles.statRow}>
          <span className={styles.statLabel}>
            <LuCalendarCheck className={styles.statIcon} />
            トレーニング実施日数
          </span>
          {isPending ? (
            <Spinner size="sm" color="fg.muted" />
          ) : (
            <span className={styles.statValue}>
              {trainingDays}
              <span className={styles.statUnit}>日</span>
            </span>
          )}
        </div>
      </section>

      <Button
        variant="outline"
        colorPalette="gray"
        mt="6"
        onClick={() => signOut()}
      >
        <LuLogOut />
        ログアウト
      </Button>
    </PageContainer>
  );
}
