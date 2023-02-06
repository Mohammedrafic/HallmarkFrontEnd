import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { debounceTime, Subject, distinctUntilChanged } from 'rxjs';

export class PartilSearchService {
  private filter$: Subject<{ dataSource: unknown[]; searchString: string; options: FieldSettingsModel }> =
    new Subject();
  private result$: Subject<unknown[]> = new Subject();

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

  public search(dataSource: unknown[], searchString: string, options: FieldSettingsModel): Subject<unknown[]> {
    this.filter$.next({ dataSource, searchString, options });
    return this.result$;
  }

  private filterItemsBySubString({
    dataSource,
    searchString,
    options,
  }: {
    dataSource: unknown[];
    searchString: string;
    options: FieldSettingsModel;
  }): unknown[] {
    return dataSource.filter((data: unknown) => {
      const itemValue = (data as Record<string, string>)[options.text!]?.trim()?.toLowerCase();
      const searchValue = searchString.trim().toLowerCase();
      return itemValue.includes(searchValue);
    });
  }
}
