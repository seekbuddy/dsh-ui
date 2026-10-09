'use client'

/**
 * Extra components (`@seekbuddy/dsh-ui/seekbuddy`).
 *
 * Everything outside this directory is a copy of the upstream DSH primitives and
 * is only touched by synchronization (see UPSTREAM.md). Components here are owned
 * by this package and styled only through `--dsw-*` tokens. They must import DSH
 * primitives through the public `@seekbuddy/dsh-ui` entry — never by relative
 * path — so a bundler can alias that entry to another copy of the primitives
 * (such as the one a DSH web shell already loads).
 */

export { Calendar } from './date/Calendar.tsx'
export { Card } from './Card.tsx'
export type { CardElement, CardPadding, CardProps } from './Card.tsx'
export { DangerButton } from './DangerButton.tsx'
export type { DangerButtonProps } from './DangerButton.tsx'
export { SubtleButton } from './SubtleButton.tsx'
export type { SubtleButtonProps } from './SubtleButton.tsx'
export type {
  CalendarBaseProps,
  CalendarDayState,
  CalendarLabels,
  CalendarProps,
  CalendarRangePosition,
  CalendarRangeProps,
  CalendarSingleProps,
  DateRangeDraft,
} from './date/Calendar.tsx'
export { DatePicker } from './date/DatePicker.tsx'
export type { DatePickerLabels, DatePickerProps } from './date/DatePicker.tsx'
export { DateRangePicker } from './date/DateRangePicker.tsx'
export type { DateRangePickerLabels, DateRangePickerProps, DateRangePreset } from './date/DateRangePicker.tsx'
export { DateField, DateRangeField, TimeField } from './date/fields.tsx'
export type { DateFieldProps, DateRangeFieldProps, FieldLabels, TimeFieldProps } from './date/fields.tsx'
export { TimePicker } from './date/TimePicker.tsx'
export type { MinuteStep, TimePickerLabels, TimePickerProps } from './date/TimePicker.tsx'
export type { DateRange, IsoDate, IsoMonth, IsoTime, WeekStart } from './date/date.ts'
export { Empty } from './Empty.tsx'
export type { EmptyProps, EmptyStatus } from './Empty.tsx'
export { Mark } from './Mark.tsx'
export type { MarkKind, MarkProps, MarkSize } from './Mark.tsx'
export { MessageProvider, useMessage } from './Message.tsx'
export type { MessageApi, MessageClose, MessageOptions, MessageProviderProps, MessageType } from './Message.tsx'
export { Pagination, pageItems } from './Pagination.tsx'
export type { PaginationItem, PaginationLabels, PaginationProps } from './Pagination.tsx'
export { QrCode } from './qr/QrCode.tsx'
export type { QrCodeProps } from './qr/QrCode.tsx'
export { Spinner } from './Spinner.tsx'
export type { SpinnerProps, SpinnerSize, SpinnerTone } from './Spinner.tsx'
export { StatusBadge } from './StatusBadge.tsx'
export type { StatusBadgeProps, StatusTone } from './StatusBadge.tsx'
export { Switch } from './Switch.tsx'
export type { SwitchProps, SwitchSize } from './Switch.tsx'
export { Tabs } from './Tabs.tsx'
export type { TabItem, TabsProps } from './Tabs.tsx'
export { Timeline } from './Timeline.tsx'
export type { TimelineGroup, TimelineItem, TimelineProps, TimelineStatus } from './Timeline.tsx'
export { Upload } from './Upload.tsx'
export type {
  UploadItem,
  UploadLabels,
  UploadLayout,
  UploadProps,
  UploadRejection,
  UploadRejectReason,
  UploadStatus,
} from './Upload.tsx'
