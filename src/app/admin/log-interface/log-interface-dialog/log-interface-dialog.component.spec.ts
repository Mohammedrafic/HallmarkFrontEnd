import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogInterfaceDialogComponent } from './log-interface-dialog.component';

describe('LogInterfaceDialogComponent', () => {
  let component: LogInterfaceDialogComponent;
  let fixture: ComponentFixture<LogInterfaceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogInterfaceDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogInterfaceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
