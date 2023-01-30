export interface ChipItem {
  groupTitle: string;
  groupField: string;
  data: string[];
}

export interface ChipDeleteEvent {
  field: string;
  value: string;
}

export type ChipDeleteEventType = ChipDeleteEvent | null;