import {Injectable} from '@angular/core';
import introJs from "intro.js";
import {Preferences} from "@capacitor/preferences";
import {ClientService} from "../client/client.service";
import {GeneralService} from "../general/general.service";
import {NavigationEnd, Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";

@Injectable({
  providedIn: 'root'
})
export class IntroJsService {
  displayIntro: boolean = true;

  constructor(private clientService: ClientService, private generalService: GeneralService,
              private router: Router, private translate: TranslateService) {
    // this.router.events.subscribe((event) => {
    //   if (event instanceof NavigationEnd) {
    //     introJs().exit(true);
    //   }
    // });
  }

  async showHelp(selector: any, steps: any, from: any) {
    introJs().exit(true); // Ensure no previous intro is running
    // const introStatus = await Preferences.get({key: 'intro_' + selector});
    const introStatus = this.generalService.clientInit?.user?.hasSeenIntros?.[selector];
    // console.log(introStatus)
    if (!introStatus && this.displayIntro) {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const intro = introJs();
          intro.setOptions({
            steps,
            exitOnOverlayClick: true,
            exitOnEsc: true,
            prevLabel: this.translate.instant('Back'),
            nextLabel: this.translate.instant('Next'),
            doneLabel: this.translate.instant('Done')
          });

          intro.start();

          // Resolve the promise when the intro completes or exits
          intro.oncomplete(() => {
            // Preferences.set({key: 'intro_' + selector, value: JSON.stringify(true)});
            if (from != 'side' && from != 'header') {
              this.clientService.postIntro(selector).then(async data => {
                await this.generalService.getUserData();
                await Preferences.remove({key: 'account'});
                await Preferences.set({key: 'account', value: JSON.stringify(data.data)});
                this.generalService.clientInit.user = data.data;
              })
            }
            resolve();
          }).onexit(() => {
            // Preferences.set({key: 'intro_' + selector, value: JSON.stringify(true)});
            if (from != 'side' && from != 'header') {
              this.clientService.postIntro(selector).then(async data => {
                this.generalService.clientInit.user = data.data;
                await Preferences.remove({key: 'account'});
                await Preferences.set({key: 'account', value: JSON.stringify(data.data)});
                await this.generalService.getUserData();
              })
            }
            resolve();
          });
        }, 100);
      });
    }
  }

  async removeStorageOfIntro(removeIntro: any): Promise<any> {
    const storageKey = await Preferences.keys();
    const storageKeyArr = storageKey.keys;
    const promises = storageKeyArr.map((value) => {
      if (removeIntro) {
        if (value && value.startsWith('intro_')) {
          Preferences.remove({key: value});
        }
      } else {
        if (value && !value.startsWith('intro_')) {
          Preferences.remove({key: value});
        }
      }

    });
    await Promise.all(promises);
    return true;
  }
}
