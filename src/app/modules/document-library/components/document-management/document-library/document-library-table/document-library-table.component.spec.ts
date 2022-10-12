import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentLibraryTableComponent } from './document-library-table.component';

describe('DocumentLibraryTableComponent', () => {
  let component: DocumentLibraryTableComponent;
  let fixture: ComponentFixture<DocumentLibraryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentLibraryTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentLibraryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
