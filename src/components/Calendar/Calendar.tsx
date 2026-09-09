import { IconButton } from "@chakra-ui/react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuDumbbell,
  LuScale,
} from "react-icons/lu";
import {
  addMonths,
  formatMonthLabel,
  getCalendarDays,
  getTodayDateString,
  toDateString,
} from "@/utils/date";
import styles from "./Calendar.module.css";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;

type CalendarProps = {
  /** 表示する年 */
  year: number;
  /** 表示する月(1-12) */
  month: number;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onMonthChange: (year: number, month: number) => void;
  /** トレーニング記録がある日付("YYYY-MM-DD") */
  workoutDates: Set<string>;
  /** 体重記録がある日付("YYYY-MM-DD") */
  weightDates: Set<string>;
};

function Calendar({
  year,
  month,
  selectedDate,
  onSelectDate,
  onMonthChange,
  workoutDates,
  weightDates,
}: CalendarProps) {
  const today = getTodayDateString();
  const now = new Date();
  const isViewingCurrentMonth =
    now.getFullYear() === year && now.getMonth() === month - 1;
  const days = getCalendarDays(year, month);

  const goToMonth = (delta: number) => {
    const next = addMonths(year, month, delta);
    onMonthChange(next.year, next.month);
  };

  const goToToday = () => {
    onMonthChange(now.getFullYear(), now.getMonth() + 1);
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.head}>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="前の月"
          onClick={() => goToMonth(-1)}
        >
          <LuChevronLeft />
        </IconButton>
        <span className={styles.monthLabel}>
          {formatMonthLabel(year, month)}
        </span>
        <div className={styles.headRight}>
          {!isViewingCurrentMonth && (
            <button
              type="button"
              className={styles.todayButton}
              onClick={goToToday}
            >
              今月
            </button>
          )}
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="次の月"
            onClick={() => goToMonth(1)}
          >
            <LuChevronRight />
          </IconButton>
        </div>
      </div>

      <div className={styles.weekdays}>
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className={styles.weekday}>
            {label}
          </span>
        ))}
      </div>

      <div className={styles.grid}>
        {days.map((day) => {
          const dateString = toDateString(day);
          const isCurrentMonth = day.getMonth() === month - 1;
          const isToday = dateString === today;
          const isSelected = dateString === selectedDate;
          const hasWorkout = workoutDates.has(dateString);
          const hasWeight = weightDates.has(dateString);

          return (
            <button
              key={dateString}
              type="button"
              className={styles.cell}
              data-outside={!isCurrentMonth || undefined}
              data-today={isToday || undefined}
              data-selected={isSelected || undefined}
              aria-current={isToday ? "date" : undefined}
              aria-label={dateString}
              onClick={() => onSelectDate(dateString)}
            >
              <span className={styles.dayNumber}>{day.getDate()}</span>
              <span className={styles.marks}>
                {hasWorkout && (
                  <LuDumbbell
                    className={styles.mark}
                    aria-label="トレーニング記録あり"
                  />
                )}
                {hasWeight && (
                  <LuScale className={styles.mark} aria-label="体重記録あり" />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { Calendar };
