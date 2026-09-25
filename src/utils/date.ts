/** Date をローカルタイムゾーン基準で "YYYY-MM-DD" 文字列に変換する */
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayDateString(): string {
  return toDateString(new Date());
}

/** "YYYY-MM-DD" をローカルタイムの Date に変換する */
export function parseDateString(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** year/month(1-12) に delta ヶ月を加えた year/month を返す */
export function addMonths(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const base = new Date(year, month - 1 + delta, 1);
  return { year: base.getFullYear(), month: base.getMonth() + 1 };
}

/**
 * カレンダー表示用に、指定月(month は 1-12)を含む 6 週間ぶん
 * (日曜始まりの 42 日)の Date 配列を返す。
 */
export function getCalendarDays(year: number, month: number): Date[] {
  const start = new Date(year, month - 1, 1);
  start.setDate(start.getDate() - start.getDay());

  const days: Date[] = [];
  const cursor = new Date(start);
  for (let i = 0; i < 42; i += 1) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

/** 指定日を含む週(月曜〜日曜)の開始日・終了日を "YYYY-MM-DD" で返す */
export function getWeekRange(dateString: string): {
  start: string;
  end: string;
} {
  const date = parseDateString(dateString);
  const start = new Date(date);
  const day = start.getDay(); // 0(日)〜6(土)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: toDateString(start), end: toDateString(end) };
}

/** グラフで振り返る期間。直近 1 週間 / 1 ヶ月 / 1 年 */
export type StatsPeriod = "week" | "month" | "year";

export type StatsBucket = {
  /** バケットを一意に識別するキー */
  key: string;
  /** X軸に表示する短いラベル */
  label: string;
  /** バケットの開始日 "YYYY-MM-DD"（含む） */
  start: string;
  /** バケットの終了日 "YYYY-MM-DD"（含む） */
  end: string;
};

/**
 * 指定日を基準に、期間を区切ったバケット列を古い順で返す。
 * - week: 直近 7 日（当日を含む）を日単位
 * - month: 直近 30 日（当日を含む）を日単位
 * - year: 直近 12 ヶ月（当月を含む）を月単位
 */
export function getStatsBuckets(
  period: StatsPeriod,
  refDateString: string = getTodayDateString(),
): StatsBucket[] {
  const ref = parseDateString(refDateString);
  const buckets: StatsBucket[] = [];

  if (period === "year") {
    for (let offset = 11; offset >= 0; offset -= 1) {
      const first = new Date(ref.getFullYear(), ref.getMonth() - offset, 1);
      const last = new Date(ref.getFullYear(), ref.getMonth() - offset + 1, 0);
      buckets.push({
        key: `${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, "0")}`,
        label: `${first.getMonth() + 1}月`,
        start: toDateString(first),
        end: toDateString(last),
      });
    }
    return buckets;
  }

  const days = period === "week" ? 7 : 30;
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(ref);
    day.setDate(day.getDate() - offset);
    const key = toDateString(day);
    buckets.push({
      key,
      label: `${day.getMonth() + 1}/${day.getDate()}`,
      start: key,
      end: key,
    });
  }
  return buckets;
}

/** "2026年9月" 形式の月ラベル */
export function formatMonthLabel(year: number, month: number): string {
  return `${year}年${month}月`;
}

/** 指定月(month は 1-12)の初日・末日を "YYYY-MM-DD" で返す */
export function getMonthRange(
  year: number,
  month: number,
): { start: string; end: string } {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return { start: toDateString(start), end: toDateString(end) };
}

/** "9/7" のような短い日付表記 */
export function formatShortDate(dateString: string): string {
  const date = parseDateString(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;

/** "9月8日(月)" 形式の日付ラベル */
export function formatDateLabel(dateString: string): string {
  const date = parseDateString(dateString);
  const weekday = WEEKDAY_LABELS[date.getDay()];
  return `${date.getMonth() + 1}月${date.getDate()}日(${weekday})`;
}
