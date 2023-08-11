import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { SelectingEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { CandidateDetailsTabs } from '@shared/enums/candidate-tabs.enum';
import { Actions, Select, Store } from '@ngxs/store';
import { SelectNavigation } from '@shared/components/candidate-details/store/candidate.actions';
import { filter, Observable, takeUntil } from 'rxjs';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { CandidateDetailsState } from '@shared/components/candidate-details/store/candidate.state';
import { NavigationTabModel } from '@shared/components/candidate-details/models/candidate.model';
import { CandidateDetailsFilterTab } from '@shared/enums/candidate-assignment.enum';

@Component({
  selector: 'app-tab-navigation',
  templateUrl: './tab-navigation.component.html',
})
export class TabNavigationComponent extends DestroyableDirective {
  @Select(CandidateDetailsState.navigationTab)
  candidateTab$: Observable<NavigationTabModel>;
  @Output() selectedTab = new EventEmitter<CandidateDetailsFilterTab>();
  private tabsArray = Object.values(CandidateDetailsFilterTab);
  @ViewChild('tabNavigation') tabNavigation: TabComponent;

  public tabTitle = CandidateDetailsTabs;
  public tabsList = Object.values(CandidateDetailsTabs);

  constructor(private actions: Actions, private store: Store) {
    super();
  }

  public onTabCreated(): void {
    this.candidateTab$
      .pipe(
        filter(({ pending }: NavigationTabModel) => pending === 0 || !!pending),
        takeUntil(this.destroy$)
      )
      .subscribe(({ pending }: NavigationTabModel) => {
        this.tabNavigation.select(pending as number | HTMLElement);
      });
  }

  public onSelect(selectedTab: SelectingEventArgs): void {
    this.store.dispatch(new SelectNavigation(null, selectedTab.selectingIndex, false));
    this.selectedTab.emit(selectedTab.selectingIndex);
  }
}
