import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {

  onLogoClick(): void {
    const userAgent = navigator.userAgent.toLocaleLowerCase()
    const isMobile = /android|iphone|ipad|ipod/i.test(userAgent)
    
    if(isMobile){
      window.location.href = 'sbbmobile://'
      
      setTimeout(() => {
        if(/android/i.test(userAgent)){
          window.location.href = 'https://play.google.com/store/apps/details?id=ch.sbb.mobile.android.b2c';
        } else if (/iphone|ipad|ipod/i.test(userAgent)) {
          window.location.href = 'https://apps.apple.com/ch/app/sbb-mobile/id294855237';
        }
      }, 1200);
    } else {
      window.open('https://www.sbb.ch', '_blank')
    }
  }
}
