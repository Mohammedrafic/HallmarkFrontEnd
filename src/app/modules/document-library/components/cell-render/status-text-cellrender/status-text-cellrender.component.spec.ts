import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusTextCellrenderComponent } from './status-text-cellrender.component';

describe('StatusTextCellrenderComponent', () => {
  let component: StatusTextCellrenderComponent;
  let fixture: ComponentFixture<StatusTextCellrenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatusTextCellrenderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusTextCellrenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
