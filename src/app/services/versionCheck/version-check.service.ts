import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GeneralService} from "../general/general.service";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root',
})
export class VersionCheckService {
  private currentVersion = environment.version;

  constructor(private http: HttpClient, private generalService: GeneralService) {
  }

  checkForUpdate() {
    const serverVersion = this.generalService.clientInit.frontAppVersion;
    if (this.isNewVersion(serverVersion)) {
      this.clearCacheAndReload();
    }
  }

  private isNewVersion(serverVersion: string): boolean {
    return serverVersion !== this.currentVersion;
  }

  private clearCacheAndReload() {
    if (caches) {
      // Clear all service worker caches
      caches.keys().then(function (names) {
        for (let name of names) {
          caches.delete(name);
        }
      });
    }
    // Reload the application
    window.location.reload();
  }
}
