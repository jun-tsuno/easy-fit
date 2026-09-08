import { useSearchParams } from "react-router";
import { getTodayDateString } from "@/utils/date";

export function useDateParam() {
  const [searchParams, setSearchParams] = useSearchParams();
  const date = searchParams.get("date") ?? getTodayDateString();

  const setDate = (next: string) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("date", next);
      return params;
    });
  };

  return [date, setDate] as const;
}
