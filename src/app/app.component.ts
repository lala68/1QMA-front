import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {register} from 'swiper/element/bundle';
import {TranslateService} from "@ngx-translate/core";
import {GeneralService} from "./services/general/general.service";
import {AuthService} from "./services/auth/auth.service";
import {ClientService} from "./services/client/client.service";
import {Preferences} from "@capacitor/preferences";
import {Location} from "@angular/common";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
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
import {VersionCheckService} from "./services/versionCheck/version-check.service";
import {Platform} from "@angular/cdk/platform";
import {AngularFireAnalytics} from "@angular/fire/compat/analytics";

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
              private gameComponent: GamesComponent, private gameService: GamesService, private platform: Platform,
              private loader: LoaderService, private shopService: ShopService, private versionCheckService: VersionCheckService, private analytics: AngularFireAnalytics) {
    // Force light mode
    const html = document.documentElement;
    html.style.setProperty('color-scheme', 'light');
  }

  ngOnInit(): void {
    this.starter().then(async (data) => {
      this.generalService.socket = io('https://api.staging.1qma.games', {withCredentials: true});
      this.generalService.socket.on("connect", () => {
      });

      this.generalService.socket.on("notification", (arg: any) => {
        this.generalService.newNotif = true;
        this.shopService.getNotifications(1, 3).then(data => {
          this.generalService.notifList = data.data;
        })
      });

      this.generalService.socket.on("notification:modal", (arg: any) => {
        const dialogConfig = new MatDialogConfig();
        if (this.generalService.isMobileView) { // Assuming mobile devices are <= 768px
          dialogConfig.width = '100vw';
          dialogConfig.maxWidth = '100vw';
          dialogConfig.height = 'auto'; // You can specify the height if needed
          dialogConfig.position = {bottom: '0px'};
          dialogConfig.panelClass = 'mobile-dialog'; // Add custom class for mobile
          dialogConfig.data = arg;
          dialogConfig.disableClose = true;
        } else {
          dialogConfig.width = '500px'; // Full size for desktop or larger screens
          dialogConfig.data = arg;
          dialogConfig.disableClose = true;
        }
        const dialogRef = this.dialog.open(NotificationModalComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(async result => {
          if (result == 'success') {
          }
        });
      });

      setTimeout(() => {
        this.route.queryParams.subscribe(async params => {
          await this.generalService.getUserData();
          // console.log(params);
          if (this.generalService.userObj) {
            this.generalService.onFontSelect(this.generalService.userObj?.preferedFont);
          }
          const invitation_id = params['id'];
          const status = params['status'];
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
                  if (user.data.hasSeenIntros.tutorial) {
                    if (user.data?.defaultHomePage == '/games') {
                      await this.router.navigate(['/games/overview']);
                    } else {
                      await this.router.navigate([user.data?.defaultHomePage]);
                      this.generalService.currentRout = user.data?.defaultHomePage;
                    }
                  } else {
                    await this.router.navigate(['/tutorial']);
                  }
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
            const currentPath = this.router.url;
            if (currentPath.includes('signup-refer-email') || currentPath.includes('signup')) {
              this.router.navigate(['/login']);
            }
            this.openDialog(JSON.stringify(message), 'Error');
            return;
          } else {
            if (invitation_id) {
              if (!this.generalService.userId) {
                this.authService.registerInvitationLink(invitation_id).then(data => {
                  if (data.status == 1) {
                    this.generalService.userId = data.data._id;
                    this.router.navigate(['/signup-refer-email'], {
                      state: {
                        email: data.data.email,
                        invitationId: invitation_id
                      }
                    });
                  } else {
                    this.openDialog(data.message, 'Error');
                  }
                })
              }
            } else {
              if (this.generalService.userId) {
                this.clientService.clientInit().then(async data => {
                  this.generalService.clientInit = data.data;
                  this.generalService.userObj = (data.data.user);
                  this.generalService.hasCompletedSignup = data.data.user.hasCompletedSignup;
                  this.generalService.emailVerified = data.data.user.emailVerified;
                  //
                  await Preferences.remove({key: 'account'});
                  await Preferences.set({key: 'account', value: JSON.stringify(data.data.user)});
                  //
                  this.versionCheckService.checkForUpdate();
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
                          if (user.data.hasSeenIntros.tutorial) {
                            if (user.data?.defaultHomePage == '/games') {
                              await this.router.navigate(['/games/overview']);
                            } else {
                              await this.router.navigate([user.data?.defaultHomePage]);
                              this.generalService.currentRout = user.data?.defaultHomePage;
                            }
                          } else {
                            await this.router.navigate(['/tutorial']);
                          }
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
                    await this.translateService.setDefaultLang(this.generalService.userObj?.preferedLanguage?.code);
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
                    // this.generalService.onFontSelect(this.generalService.userObj?.preferedFont);
                    // console.log(this.generalService.userObj?.preferedFont)
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
                    if (this.generalService.userObj.hasSeenIntros?.tutorial) {
                      this.router.navigate([(this.router.url === ('/login') || this.router.url === ('/signup') || this.router.url === ('/forget-password')
                        || this.router.url === ('/wizard') || this.router.url === ('/signup-social') || this.router.url === ('/signup-refer-email')
                        || this.router.url === ('/social/callback')) ? '/dashboard' : this.location.path()]);
                      // await this.generalService.useGoogleTranslate();
                      this.generalService.currentRout = this.router.url;
                      // this.generalService.onFontSelect(this.generalService.userObj?.preferedFont);
                    } else {
                      await this.router.navigate(['/tutorial']);
                    }
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
          }
          if (game_code) {
            this.gameService.gameInit().then(data => {
              if (data.status == 1) {
                this.generalService.gameInit = data.data;
                this.gameComponent.joinToGame(game_code);
              }
            }, error => {
              return this.processHTTPMsgService.handleError(error);
            });
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
