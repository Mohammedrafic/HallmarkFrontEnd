import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportDialogContentComponent } from './import-dialog-content.component';

describe('ImportDialogContentComponent', () => {
  let component: ImportDialogContentComponent;
  let fixture: ComponentFixture<ImportDialogContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportDialogContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportDialogContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
