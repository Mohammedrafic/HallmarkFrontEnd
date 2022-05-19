import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupMappingComponent } from './group-mapping.component';

describe('GroupMappingComponent', () => {
  let component: GroupMappingComponent;
  let fixture: ComponentFixture<GroupMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupMappingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
