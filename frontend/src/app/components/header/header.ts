import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {

  onLogoClick(): void {
    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(ua);
    const isIOS = /iphone|ipad|ipod/.test(ua);

    const ANDROID_STORE = 'https://play.google.com/store/apps/details?id=ch.sbb.mobile.android.b2c';
    const IOS_STORE = 'https://apps.apple.com/ch/app/sbb-mobile/id294855237';

    const openWithFallback = (appUrl: string, storeUrl: string) => {
      let timer: any;

      const cancel = () => {
        if (timer) clearTimeout(timer);
        window.removeEventListener('pagehide', cancel);
        window.removeEventListener('blur', cancel);
        window.removeEventListener('visibilitychange', onVis);
      };
      const onVis = () => {
        if (document.hidden) cancel();
      };

      window.addEventListener('pagehide', cancel);      
      window.addEventListener('blur', cancel);          
      document.addEventListener('visibilitychange', onVis);

      window.location.href = appUrl;

      timer = setTimeout(() => {
        window.location.href = storeUrl;
      }, 1200);
    };

    if (isAndroid) {
      openWithFallback('sbbmobile://', ANDROID_STORE);
      return;
    }

    if (isIOS) {
      openWithFallback('sbbmobile://', IOS_STORE);
      return;
    }

    window.open('https://www.sbb.ch', '_blank');
  }
}
