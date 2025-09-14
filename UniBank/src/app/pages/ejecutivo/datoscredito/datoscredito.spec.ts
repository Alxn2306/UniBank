import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Datoscredito } from './datoscredito';

describe('Datoscredito', () => {
  let component: Datoscredito;
  let fixture: ComponentFixture<Datoscredito>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Datoscredito]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Datoscredito);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
