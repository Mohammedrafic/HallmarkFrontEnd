import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentdataComponent } from './commentdata.component';

describe('CommentdataComponent', () => {
  let component: CommentdataComponent;
  let fixture: ComponentFixture<CommentdataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommentdataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentdataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
