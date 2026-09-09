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

/** 指定日を含む週(日曜〜土曜)の開始日・終了日を "YYYY-MM-DD" で返す */
export function getWeekRange(dateString: string): {
  start: string;
  end: string;
} {
  const date = parseDateString(dateString);
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: toDateString(start), end: toDateString(end) };
}

/** グラフの期間粒度 */
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

/** 各粒度で表示するバケット数 */
const BUCKET_COUNT: Record<StatsPeriod, number> = {
  week: 12,
  month: 12,
  year: 5,
};

/**
 * 指定日を基準に、粒度ごとの連続したバケット列を古い順で返す。
 * - week: 直近 12 週（日曜〜土曜）
 * - month: 直近 12 ヶ月
 * - year: 直近 5 年
 */
export function getStatsBuckets(
  period: StatsPeriod,
  refDateString: string = getTodayDateString(),
): StatsBucket[] {
  const ref = parseDateString(refDateString);
  const count = BUCKET_COUNT[period];
  const buckets: StatsBucket[] = [];

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    if (period === "week") {
      const start = new Date(ref);
      start.setDate(start.getDate() - start.getDay() - offset * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      buckets.push({
        key: toDateString(start),
        label: `${start.getMonth() + 1}/${start.getDate()}`,
        start: toDateString(start),
        end: toDateString(end),
      });
    } else if (period === "month") {
      const start = new Date(ref.getFullYear(), ref.getMonth() - offset, 1);
      const end = new Date(ref.getFullYear(), ref.getMonth() - offset + 1, 0);
      buckets.push({
        key: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`,
        label: `${start.getMonth() + 1}月`,
        start: toDateString(start),
        end: toDateString(end),
      });
    } else {
      const year = ref.getFullYear() - offset;
      buckets.push({
        key: String(year),
        label: `${year}`,
        start: `${year}-01-01`,
        end: `${year}-12-31`,
      });
    }
  }

  return buckets;
}

/** "2026年9月" 形式の月ラベル */
export function formatMonthLabel(year: number, month: number): string {
  return `${year}年${month}月`;
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
