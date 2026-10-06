import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";

import { getDefaultDateRange, type DateRange } from "../utils/dateRange";

type DateRangeContextValue = {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
};

const DateRangeContext = createContext<DateRangeContextValue | null>(null);

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRangeState] = useState<DateRange>(() => getDefaultDateRange());

  const setDateRange = useCallback((range: DateRange) => {
    setDateRangeState(range);
  }, []);

  const value = useMemo(
    () => ({
      dateRange,
      setDateRange
    }),
    [dateRange, setDateRange]
  );

  return <DateRangeContext.Provider value={value}>{children}</DateRangeContext.Provider>;
}

export function useDateRange(): DateRangeContextValue {
  const context = useContext(DateRangeContext);

  if (!context) {
    throw new Error("useDateRange must be used within DateRangeProvider");
  }

  return context;
}
