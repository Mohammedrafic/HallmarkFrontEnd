import { NgModule } from '@angular/core';

import { PageToolbarComponent } from './components/page-toolbar/page-toolbar.component';

const COMPONENTS = [PageToolbarComponent];

@NgModule({
    imports: [],
    exports: [...COMPONENTS],
    declarations: [...COMPONENTS],
    providers: [],
})
export class SharedModule { }
