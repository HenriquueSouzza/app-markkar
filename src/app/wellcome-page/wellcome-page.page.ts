import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-wellcome-page',
  templateUrl: './wellcome-page.page.html',
  styleUrls: ['./wellcome-page.page.scss'],
})
export class WellcomePagePage implements OnInit {


  slideOpts = {
    initialSlide: 1,
    speed: 2000
  };

  constructor() { }

  ngOnInit() {
  }

}
