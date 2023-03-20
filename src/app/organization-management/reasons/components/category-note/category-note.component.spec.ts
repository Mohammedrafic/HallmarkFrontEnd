import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryNoteComponent } from './category-note.component';

describe('CategoryNoteComponent', () => {
  let component: CategoryNoteComponent;
  let fixture: ComponentFixture<CategoryNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CategoryNoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
