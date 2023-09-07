import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConciliacionesinversionesComponent } from './conciliacionesinversiones.component';

describe('ConciliacionesinversionesComponent', () => {
  let component: ConciliacionesinversionesComponent;
  let fixture: ComponentFixture<ConciliacionesinversionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConciliacionesinversionesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConciliacionesinversionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
