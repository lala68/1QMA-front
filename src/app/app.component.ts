import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {register} from 'swiper/element/bundle';
import {TranslateService} from "@ngx-translate/core";
import {GeneralService} from "./services/general/general.service";
import {AuthService} from "./services/auth/auth.service";
import {ClientService} from "./services/client/client.service";
import {Preferences} from "@capacitor/preferences";
import {Location} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {SnackbarContentComponent} from "./components/snackbar-content/snackbar-content.component";
import {io} from "socket.io-client";
import {GamesComponent} from "./components/games/games.component";
import {Disconnected, GameBoardComponent} from "./components/game-board/game-board.component";
import {CountdownTimerComponent} from "./components/countdown-timer/countdown-timer.component";
import {GamesService} from "./services/games/games.service";
import {LoaderService} from "./services/loader/loader.service";
import {error} from "@angular/compiler-cli/src/transformers/util";
import {ProcessHTTPMsgService} from "./services/proccessHttpMsg/process-httpmsg.service";
import {SignupComponent} from "./components/signup/signup.component";
import {ShopService} from "./services/shop.service";
import {NotificationModalComponent} from "./components/notification-modal/notification-modal.component";

register();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [GamesComponent, GameBoardComponent, CountdownTimerComponent, SignupComponent]
})
export class AppComponent implements OnInit {
  loading$ = this.loader.isLoading$;
  title = '1QMA';

  constructor(private router: Router, private translateService: TranslateService, private _snackBar: MatSnackBar,
              private generalService: GeneralService, private authService: AuthService, public dialog: MatDialog,
              private clientService: ClientService, private route: ActivatedRoute, private location: Location,
              private processHTTPMsgService: ProcessHTTPMsgService, private signupComponent: SignupComponent,
              private gameComponent: GamesComponent, private gameService: GamesService,
              private loader: LoaderService, private shopService: ShopService) {
  }

  ngOnInit(): void {
    this.starter().then(async (data) => {
      this.generalService.socket = io('https://api.staging.1qma.games', {withCredentials: true});
      this.generalService.socket.on("connect", () => {
        const now = new Date();
        const timeString = now.toLocaleTimeString(); // This will include hours, minutes, and seconds
        console.log("connect" + ' ' + `[${timeString}]`);
        if (this.generalService.disconnectedModal) {
          this.generalService.disconnectedModal.close();
          this.generalService.disconnectedModal = '';
        }
      });

      this.generalService.socket.on("notification", (arg: any) => {
        console.log(arg)
        this.generalService.newNotif = true;
        this.shopService.getNotifications(1, 3).then(data => {
          this.generalService.notifList = data.data;
        })
      });

      this.generalService.socket.on("notification:modal", (arg: any) => {
        console.log(arg)
        this.dialog.open(NotificationModalComponent, {
          data: arg,
          width: '500px',
          disableClose: true
        });
      });

      setTimeout(() => {
        this.route.queryParams.subscribe(async params => {
          await this.generalService.getUserData();
          console.log(params);
          const status = params['status'];
          // alert('status: ' + status)
          const user_id = params['user_id'];
          // alert('user_id: ' + user_id)
          const message = params['message'];
          // alert('message: ' + params['code'])
          const game_code = params['code'];

          if (status == 1) {
            if (user_id) {
              await Preferences.remove({key: 'account'});
              await Preferences.set({key: 'account', value: JSON.stringify({_id: user_id})});
            }
            await this.authService.isAuthenticated();
            await this.generalService.getUserData();
            this.authService.getUserDetails(this.generalService.userId).then(async user => {
              await Preferences.remove({key: 'account'});
              await Preferences.set({key: 'account', value: JSON.stringify(user.data)});
              if (user.data.inWaitList) {
                await this.authService.forceToLoginAgain();
                await this.router.navigate(['/signup'], {state: {waitList: true}});
              } else {
                if (user.data.hasCompletedSignup && user.data.emailVerified) {
                  this.gameService.gameInit().then(data => {
                    if (data.status == 1) {
                      this.generalService.gameInit = data.data;
                    }
                  }, error => {
                    return this.processHTTPMsgService.handleError(error);
                  });
                  // await this.generalService.useGoogleTranslate();
                  await this.router.navigate(['/dashboard']);
                } else if (!user.data.hasCompletedSignup && user.data.emailVerified) {
                  this.authService.registerInit().then(res => {
                    if (res.status == 1) {
                      this.generalService.initData = res.data;
                      this.router.navigate(['/wizard']);
                    }
                  })
                } else {
//todo
                  await this.router.navigate(['/signup-refer-email']);

                }
              }
            }, error => {
              // alert('error')
              return this.processHTTPMsgService.handleError(error);
            });
          } else if (status == -1) {
            // alert('status == -1')
            this.openDialog(JSON.stringify(message), 'Error');
            return;
          } else {
            if(this.generalService.userId){
              this.clientService.clientInit().then(async data => {
                this.generalService.clientInit = data.data;
                this.generalService.userObj = (data.data.user);
                this.generalService.hasCompletedSignup = data.data.user.hasCompletedSignup;
                this.generalService.emailVerified = data.data.user.emailVerified;
                if (this.generalService.userId && !this.generalService.hasCompletedSignup && this.generalService.emailVerified) {
                  this.authService.getUserDetails(this.generalService.userId).then(async user => {
                    await Preferences.remove({key: 'account'});
                    await Preferences.set({key: 'account', value: JSON.stringify(user.data)});
                    if (user.data.inWaitList) {
                      await this.authService.forceToLoginAgain();
                      await this.router.navigate(['/signup'], {state: {waitList: true}});
                    } else {
                      if (user.data.hasCompletedSignup) {
                        this.gameService.gameInit().then(data => {
                          if (data.status == 1) {
                            this.generalService.gameInit = data.data;
                          }
                        }, error => {
                          return this.processHTTPMsgService.handleError(error);
                        });
                        // await this.generalService.useGoogleTranslate();
                        await this.router.navigate(['/dashboard']);
                      } else if (!this.generalService.hasCompletedSignup && this.generalService.emailVerified) {
                        this.authService.registerInit().then(res => {
                          if (res.status == 1) {
                            this.generalService.initData = res.data;
                            this.router.navigate(['/wizard']);
                          }
                        })
                      } else {
                        //todo
                        await this.router.navigate(['/signup-refer-email']);
                      }
                    }
                  }, error => {
                    return this.processHTTPMsgService.handleError(error);
                  });
                } else if (this.generalService.userId && this.generalService.hasCompletedSignup) {
                  this.authService.getUserDetails(this.generalService.userId).then(async user => {
                    await Preferences.remove({key: 'account'});
                    await Preferences.set({key: 'account', value: JSON.stringify(user.data)});
                    await this.generalService.getUserData();
                  })
                  // this.clientService.clientInit().then(async data => {
                  //   this.generalService.clientInit = data.data;
                  //   this.generalService.userObj = (data.data.user);
                  this.translateService.setDefaultLang(this.generalService.userObj?.preferedLanguage?.code);
                  document.documentElement.dir = this.generalService.userObj?.preferedLanguage?.code != 'fa' ? 'ltr' : 'rtl';
                  this.generalService.direction = document.documentElement.dir;
                  const bootstrapRTL = document.getElementById('bootstrapRTL') as HTMLLinkElement;
                  bootstrapRTL.disabled = document.documentElement.dir !== 'rtl';

                  // this.generalService.updateFontBasedOnLanguage(this.translateService.currentLang);
                  // const item = await Preferences.get({ key: 'font' });
                  // console.log(item);
                  //
                  // if (item && item.value) {
                  //   this.generalService.font = item.value;
                  this.generalService.onFontSelect(this.generalService.userObj?.preferedFont);
                  // } else {
                  //   console.log('No font value found');
                  // }
                  // }, error => {
                  //   return this.processHTTPMsgService.handleError(error);
                  // });
                  this.gameService.gameInit().then(data => {
                    if (data.status == 1) {
                      this.generalService.gameInit = data.data;
                    }
                  }, error => {
                    return this.processHTTPMsgService.handleError(error);
                  });
                  this.router.navigate([(this.router.url === ('/login') || this.router.url === ('/signup') || this.router.url === ('/forget-password')
                    || this.router.url === ('/wizard') || this.router.url === ('/signup-social') || this.router.url === ('/signup-refer-email')
                    || this.router.url === ('/social/callback')) ? '/dashboard' : this.location.path()]);
                  // await this.generalService.useGoogleTranslate();
                  this.generalService.currentRout = this.router.url;
                }
              });
            } else {
              this.authService.registerInit().then(res => {
                if (res.status == 1) {
                  this.generalService.initData = res.data;
                }
              })
            }
          }

          if (game_code) {
            this.gameComponent.joinToGame(game_code);
          }
        })
      }, 2000);
    });
  }

  openDialog(message: any, title: any) {
    this._snackBar.openFromComponent(SnackbarContentComponent, {
      data: {
        title: title,
        message: message
      },
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: title == 'Success' ? 'app-notification-success' : 'app-notification-error'
    });
  }

  async starter() {
    if (await this.authService.isAuthenticated()) {
      await this.generalService.getUserData();
    }
  }
}
