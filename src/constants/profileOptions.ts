export const DEPARTMENT_OPTIONS = ['소프트웨어개발과', '스마트IoT과', 'AI과'] as const;
export const COHORT_OPTIONS = ['8기', '9기', '10기'] as const;

export const DEPARTMENT_API_VALUES: Record<string, string> = {
  소프트웨어개발과: 'SW_DEVELOPMENT',
  스마트IoT과: 'SMART_IOT',
  AI과: 'AI',
  인공지능과: 'AI',
};

export const DEPARTMENT_LABEL_MAP: Record<string, string> = Object.entries(
  DEPARTMENT_API_VALUES
).reduce((acc, [label, value]) => {
  acc[value] = label;
  return acc;
}, {} as Record<string, string>);

export const getDepartmentLabel = (code: string | undefined | null): string => {
  if (!code) return '';
  return DEPARTMENT_LABEL_MAP[code] || code;
};