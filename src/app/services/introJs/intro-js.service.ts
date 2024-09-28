import {Injectable} from '@angular/core';
import introJs from "intro.js";
import {Preferences} from "@capacitor/preferences";
import {ClientService} from "../client/client.service";
import {GeneralService} from "../general/general.service";

@Injectable({
  providedIn: 'root'
})
export class IntroJsService {
  displayIntro: boolean = true;

  constructor(private clientService: ClientService, private generalService: GeneralService) {
  }

  async showHelp(selector: any, steps: any) {
    introJs().exit(true); // Ensure no previous intro is running
    // const introStatus = await Preferences.get({key: 'intro_' + selector});
    const introStatus = this.generalService.clientInit?.user?.hasSeenIntros?.[selector]

    if (!introStatus && this.displayIntro) {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const intro = introJs();
          intro.setOptions({
            steps,
            exitOnOverlayClick: true,
            exitOnEsc: true,
          });

          intro.start();

          // Resolve the promise when the intro completes or exits
          intro.oncomplete(() => {
            // Preferences.set({key: 'intro_' + selector, value: JSON.stringify(true)});
            this.clientService.postIntro(selector).then(data => {

            })
            resolve();
          }).onexit(() => {
            // Preferences.set({key: 'intro_' + selector, value: JSON.stringify(true)});
            this.clientService.postIntro(selector).then(data => {

            })
            resolve();
          });
        }, 1000);
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
