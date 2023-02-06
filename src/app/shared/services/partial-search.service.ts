
import { FieldSettingsModel } from "@syncfusion/ej2-angular-dropdowns";
import { debounceTime, Subject, distinctUntilChanged } from "rxjs";

export class PartilSearchService {
  private filter$: Subject<{ dataSource: unknown[], searchString: string, options: FieldSettingsModel }> = new Subject();
  private result$: Subject<unknown[]> = new Subject();

  constructor() {
    this.subscribeToFilter();
  }

  private subscribeToFilter(): void {
    this.filter$.pipe(debounceTime(400), distinctUntilChanged
      ((prev, curr) => prev.searchString === curr.searchString)).subscribe(({ dataSource, searchString, options }) => {
        const result = dataSource.filter((data: any) => {
          const itemValue = data[options.text!]?.trim()?.toLowerCase();
          const searchValue = searchString.trim().toLowerCase();
          return itemValue.includes(searchValue);
        });
        this.result$.next(result);
      });
  }

  public search(dataSource: unknown[], searchString: string, options: FieldSettingsModel): Subject<unknown[]> {
    this.filter$.next({ dataSource, searchString, options });
    return this.result$;
  }
}
