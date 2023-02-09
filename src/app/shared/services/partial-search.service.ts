import { PartialSearchDataType } from '@shared/models/partial-search-data-source.model';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { debounceTime, Subject, distinctUntilChanged } from 'rxjs';

export class PartialSearchService {
  private filter$: Subject<{ dataSource: PartialSearchDataType[]; searchString: string; options: FieldSettingsModel }> =
    new Subject();
  private result$: Subject<PartialSearchDataType[]> = new Subject();

  constructor() {
    this.subscribeToFilter();
  }

  public searchDropdownItems<T extends unknown>(
    dataSource: T[],
    searchString: string,
    options: FieldSettingsModel
  ): Subject<PartialSearchDataType[]> {
    this.filter$.next({ dataSource: dataSource as PartialSearchDataType[], searchString, options });
    return this.result$;
  }

  private subscribeToFilter(): void {
    this.filter$
      .pipe(
        debounceTime(400),
        distinctUntilChanged((prev, curr) => prev.searchString === curr.searchString && prev.dataSource === curr.dataSource)
      )
      .subscribe((data) => {
        const result = this.filterItemsBySubString(data);
        this.result$.next(result);
      });
  }

  private filterItemsBySubString({
    dataSource,
    searchString,
    options,
  }: {
    dataSource: PartialSearchDataType[];
    searchString: string;
    options: FieldSettingsModel;
  }): PartialSearchDataType[] {
    return dataSource.filter((data: PartialSearchDataType) => {
      const itemValue = data[options.text as string]?.toLowerCase();
      const searchValue = searchString.toLowerCase();
      return itemValue?.includes(searchValue);
    });
  }
}
