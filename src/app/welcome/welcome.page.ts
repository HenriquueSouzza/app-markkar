/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { IonSlides } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {

  slideOpts = {
    initialSlide: 0,
    speed: 400,
    allowTouchMove: false
  };

  constructor(private menu: MenuController, private router: Router) { }

  @ViewChild('slider')  slides: IonSlides;

    slideNext(){
        this.slides.slideNext();
      }

    slidePrev(){
      this.slides.slidePrev();
    }

    check(){
      this.router.navigateByUrl('/home', { replaceUrl: true });
    }

  ngOnInit() {
    this.menu.enable(false, 'homeMenu');
  }

}
