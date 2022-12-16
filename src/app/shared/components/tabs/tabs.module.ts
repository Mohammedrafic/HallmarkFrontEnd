import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsComponent } from '@shared/components/tabs/tabs.component';
import { TabModule } from '@syncfusion/ej2-angular-navigations';

@NgModule({
  declarations: [TabsComponent],
  exports: [TabsComponent],
  imports: [CommonModule, TabModule],
})
export class TabsModule {}
