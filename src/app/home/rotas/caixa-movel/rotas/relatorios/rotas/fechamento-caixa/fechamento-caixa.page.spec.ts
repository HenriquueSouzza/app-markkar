import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FechamentoCaixaPage } from './fechamento-caixa.page';

describe('FechamentoCaixaPage', () => {
  let component: FechamentoCaixaPage;
  let fixture: ComponentFixture<FechamentoCaixaPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FechamentoCaixaPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FechamentoCaixaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
