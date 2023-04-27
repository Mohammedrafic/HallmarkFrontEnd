import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgInterfaceDialogComponent } from './org-interface-dialog.component';

describe('OrgInterfaceDialogComponent', () => {
  let component: OrgInterfaceDialogComponent;
  let fixture: ComponentFixture<OrgInterfaceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgInterfaceDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgInterfaceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
