import { BehaviorSubject } from 'rxjs';

import { FilteredItem } from '@shared/models/filter.model';

export interface ReportDirectiveDataModel {
  filterChangeHandler: (filters: FilteredItem[]) => void;
  filters$: BehaviorSubject<FilteredItem[]>;
}
