import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentPreviewSideDialogComponent } from './document-preview-side-dialog.component';

describe('DocumentPreviewSideDialogComponent', () => {
  let component: DocumentPreviewSideDialogComponent;
  let fixture: ComponentFixture<DocumentPreviewSideDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentPreviewSideDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentPreviewSideDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
