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
    
    
    const isAndroid = /android/.test(userAgent);
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    
    
    if(isAndroid){
      window.location.href = 'sbbmobile://'
      const storeUrl = encodeURIComponent('https://play.google.com/store/apps/details?id=ch.sbb.mobile.android.b2c')
      const intent = `intent://#Intent;scheme=sbbmobile;package=ch.sbb.mobile.android.b2c;S.browser_fallback_url=${storeUrl};end`;
      window.location.href = intent;
      return;
    }
    if (isIOS) {
      const appStoreUrl = 'https://apps.apple.com/ch/app/sbb-mobile/id294855237';

      let fallbackTimer: any;

      const cancelFallback = () => {
        if (fallbackTimer) clearTimeout(fallbackTimer);
        window.removeEventListener('pagehide', cancelFallback);
        window.removeEventListener('blur', cancelFallback);
        document.removeEventListener('visibilitychange', onVisChange);
      };
      const onVisChange = () => {
        if (document.hidden) cancelFallback();
      };

      window.addEventListener('pagehide', cancelFallback);
      window.addEventListener('blur', cancelFallback);
      document.addEventListener('visibilitychange', onVisChange);

      window.location.href = 'sbbmobile://';

      fallbackTimer = setTimeout(() => {
        window.location.href = appStoreUrl;
      }, 1200);

      return;
    }

    window.open('https://www.sbb.ch', '_blank');
  }
}
