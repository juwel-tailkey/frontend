import { useEffect, useRef, useState } from "react";

import {
  DATE_RANGE_PRESETS,
  formatDateRangeLabel,
  getDefaultDateRange,
  resolvePreset,
  type DateRange,
  type DateRangePreset
} from "../utils/dateRange";

type DateRangePickerProps = {
  value: DateRange;
  onChange: (range: DateRange) => void;
};

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<DateRangePreset>("this_month");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function applyPreset(nextPreset: DateRangePreset) {
    setPreset(nextPreset);
    if (nextPreset !== "custom") {
      onChange(resolvePreset(nextPreset));
      setOpen(false);
    }
  }

  function handleCustomStart(start: string) {
    onChange({ start, end: value.end < start ? start : value.end });
  }

  function handleCustomEnd(end: string) {
    onChange({ start: value.start > end ? end : value.start, end });
  }

  return (
    <div className="date-range-picker" ref={containerRef}>
      <button type="button" className="date-range-trigger" onClick={() => setOpen((current) => !current)}>
        <span className="date-range-label">{formatDateRangeLabel(value)}</span>
        <span aria-hidden>▾</span>
      </button>

      {open && (
        <div className="date-range-menu">
          <div className="date-range-presets">
            {DATE_RANGE_PRESETS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={preset === item.id ? "selected" : undefined}
                onClick={() => applyPreset(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {preset === "custom" && (
            <div className="date-range-custom">
              <label>
                <span>Start</span>
                <input
                  type="date"
                  value={value.start}
                  max={value.end}
                  onChange={(event) => handleCustomStart(event.target.value)}
                />
              </label>
              <label>
                <span>End</span>
                <input
                  type="date"
                  value={value.end}
                  min={value.start}
                  max={getDefaultDateRange().end}
                  onChange={(event) => handleCustomEnd(event.target.value)}
                />
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
