import { Button, IconButton, Spinner } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import {
  LuCalendarCheck,
  LuChevronLeft,
  LuChevronRight,
  LuLogOut,
  LuUser,
} from "react-icons/lu";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { useWorkoutSetsInRange } from "@/hooks/useWorkoutSets";
import { useAuth } from "@/providers/AuthProvider";
import { addMonths, formatMonthLabel, getMonthRange } from "@/utils/date";
import styles from "./MyPage.module.css";

export function MyPagePage() {
  const { user, signOut } = useAuth();

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

      {user && <p className={styles.username}>{user.username}</p>}

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
