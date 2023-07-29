import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationFormComponent } from './relation-form.component';

describe('RelationFormComponent', () => {
  let component: RelationFormComponent;
  let fixture: ComponentFixture<RelationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelationFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RelationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
