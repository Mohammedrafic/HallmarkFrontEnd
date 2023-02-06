import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { debounceTime, Subject, distinctUntilChanged } from 'rxjs';

export class PartilSearchService {
  private filter$: Subject<{ dataSource: object[]; searchString: string; options: FieldSettingsModel }> =
    new Subject();
  private result$: Subject<object[]> = new Subject();

  constructor() {
    this.subscribeToFilter();
  }

  private subscribeToFilter(): void {
    this.filter$
      .pipe(
        debounceTime(400),
        distinctUntilChanged((prev, curr) => prev.searchString === curr.searchString)
      )
      .subscribe((data) => {
        const result = this.filterItemsBySubString(data);
        this.result$.next(result);
      });
  }

  public searchDropdownItems(dataSource: object[], searchString: string, options: FieldSettingsModel): Subject<object[]> {
    this.filter$.next({ dataSource, searchString, options });
    return this.result$;
  }

  private filterItemsBySubString({
    dataSource,
    searchString,
    options,
  }: {
    dataSource: object[];
    searchString: string;
    options: FieldSettingsModel;
  }): object[] {
    return dataSource.filter((data: object) => {
      const itemValue = (data[options.text as keyof object] as string)?.trim()?.toLowerCase();
      const searchValue = searchString.trim().toLowerCase();
      return itemValue.includes(searchValue);
    });
  }
}
