import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FailedDocumentViewerComponent } from './failed-document-viewer.component';

describe('FailedDocumentViewerComponent', () => {
  let component: FailedDocumentViewerComponent;
  let fixture: ComponentFixture<FailedDocumentViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FailedDocumentViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FailedDocumentViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
