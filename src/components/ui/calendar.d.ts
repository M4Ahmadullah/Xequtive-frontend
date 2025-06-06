import * as React from "react";
import { DayPicker } from "react-day-picker";
export type CalendarProps = React.ComponentProps<typeof DayPicker>;
declare function Calendar({
  className,
  classNames,
  showOutsideDays,
  ...props
}: CalendarProps): React.JSX.Element;
declare namespace Calendar {
  const displayName: string;
}
export { Calendar };
