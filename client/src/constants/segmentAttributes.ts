import type {
  SegmentConditionAttribute,
  SegmentConditionOperator
} from "../types";

export type SegmentValueType = "number" | "select" | "text";

export type SegmentAttributeDef = {
  value: SegmentConditionAttribute;
  label: string;
  valueType: SegmentValueType;
  operators: SegmentConditionOperator[];
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
};

const NUMERIC_OPERATORS: SegmentConditionOperator[] = [">", ">=", "<", "<=", "=", "!="];
const CATEGORICAL_OPERATORS: SegmentConditionOperator[] = ["=", "!="];

export const OPERATOR_LABELS: Record<SegmentConditionOperator, string> = {
  ">": "greater than",
  ">=": "at least",
  "<": "less than",
  "<=": "at most",
  "=": "is",
  "!=": "is not"
};

export const SEGMENT_ATTRIBUTES: SegmentAttributeDef[] = [
  {
    value: "sessions",
    label: "Sessions",
    valueType: "number",
    operators: NUMERIC_OPERATORS,
    placeholder: "e.g. 1"
  },
  {
    value: "device_type",
    label: "Device Type",
    valueType: "select",
    operators: CATEGORICAL_OPERATORS,
    options: [
      { value: "desktop", label: "Desktop" },
      { value: "mobile", label: "Mobile" },
      { value: "tablet", label: "Tablet" }
    ]
  },
  {
    value: "country",
    label: "Country",
    valueType: "text",
    operators: CATEGORICAL_OPERATORS,
    placeholder: "e.g. Japan"
  },
  {
    value: "city",
    label: "City",
    valueType: "text",
    operators: CATEGORICAL_OPERATORS,
    placeholder: "e.g. Tokyo"
  }
];

export function getAttributeDef(attribute: SegmentConditionAttribute): SegmentAttributeDef {
  return SEGMENT_ATTRIBUTES.find((item) => item.value === attribute) ?? SEGMENT_ATTRIBUTES[0];
}

export const SEGMENT_COLORS = ["#3f6df0", "#22326b", "#8fd4cf", "#f0a13f", "#c94f7c", "#5aca75"];
