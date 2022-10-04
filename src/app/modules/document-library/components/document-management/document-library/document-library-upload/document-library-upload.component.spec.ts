import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentLibraryUploadComponent } from './document-library-upload.component';

describe('DocumentLibraryUploadComponent', () => {
  let component: DocumentLibraryUploadComponent;
  let fixture: ComponentFixture<DocumentLibraryUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentLibraryUploadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentLibraryUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
