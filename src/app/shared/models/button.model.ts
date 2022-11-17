import { User } from './user-managment-page.model';

export interface ButtonRenderedEvent {
  event: Event;
  rowData: User;
  btnName: string | null;
}
