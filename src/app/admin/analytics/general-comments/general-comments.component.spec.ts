import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralCommentsComponent } from './general-comments.component';

describe('GeneralCommentsComponent', () => {
  let component: GeneralCommentsComponent;
  let fixture: ComponentFixture<GeneralCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralCommentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
