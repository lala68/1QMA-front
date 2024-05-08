import {Component, OnInit, ViewChild} from '@angular/core';
import {MatSidenav} from "@angular/material/sidenav";
import {UserService} from "../../services/user/user.service";
import {GeneralService} from "../../services/general/general.service";
import {WorkspaceService} from "../../services/workspace/workspace.service";
import {MemberListComponent} from "../../components/workspace/member/member-list/member-list.component";
import {Router, RouterModule} from "@angular/router";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {WalletService} from "../../services/wallet/wallet.service";
import {BreakpointObserver} from "@angular/cdk/layout";
import {MatToolbar} from "@angular/material/toolbar";
import {SubscriptionService} from "../../services/subscription/subscription.service";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {LoginComponent} from "../../components/account-info/login/login.component";
import {AddsToWorkspaceDialog} from "../../components/card/card-list/card-list.component";
import {MaterialModule} from "../material/material.module";
import {CommonModule} from "@angular/common";
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {SharedModule} from "../shared.module";
import {MatSnackBar} from "@angular/material/snack-bar";
import {LoaderService} from "../../services/loader/loader.service";
import * as jose from "jose";
import {Preferences} from "@capacitor/preferences";
import {Plugins} from '@capacitor/core';

const {Storage} = Plugins;

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  @ViewChild(MatSidenav) sidenav!: MatSidenav;
  @ViewChild(MatToolbar) toolbar!: any;
  wsList: any;

  constructor(public userService: UserService, public generalService: GeneralService,
              public workspaceService: WorkspaceService, private router: Router,
              private observer: BreakpointObserver, public subscriptionService: SubscriptionService,
              private modalService: NgbModal, public walletService: WalletService,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.ngAfterViewInit();
    }, 10000)
  }

  openMembersListModal(id: any) {
    const modalRef = this.modalService.open(MemberListComponent, {size: 'lg', backdrop: 'static'});
    modalRef.componentInstance.data = id;
  }

  async gotoWs(id: any = null) {
    if (this.sidenav.mode === "over") {
      this.sidenav.close();
    }
    await this.router.navigate(['add-workspace'], {state: {id: id}})
  }

  async gotoWSCards(id: any, title: any, memberType: any) {
    if (this.sidenav.mode === "over") {
      this.sidenav.close();
    }
    await this.router.navigate(['workspace-cards', id], {state: {title: title, memberType: memberType}})
  }

  async gotoAddCard() {
    await this.router.navigate(['/card']);
    setTimeout(() => {
      if (this.sidenav.mode === "over") {
        this.sidenav.close();
      }
      this.router.navigate(['create-card', 0]);
    }, 10);
  }

  ngAfterViewInit() {
    this.observer.observe(["(max-width: 800px)"]).subscribe((res) => {
      setTimeout(() => {
        if (res.matches) {
          this.sidenav.mode = "over";
          this.sidenav.close();
        } else {
          this.sidenav.mode = "side";
          this.sidenav.open();
        }
      }, 4000);
    });
  }

  async closeNavMenu() {
    if (this.sidenav.mode === "over") {
      this.sidenav.close();
    }
  }

  async viewOrders(id: any) {
    await this.router.navigate(['orders'], {state: {id: id}})
  }

  async addAccount() {
    const dialogRef = this.dialog.open(AddAccountDialog, {
      width: '350px',
      enterAnimationDuration: 0,
      exitAnimationDuration: 0,
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
      }
    });
  }

  async switchUser(userEmail: any) {
    let ret = await Preferences.get({key: userEmail});
    if (ret.value != null) {
      const user = JSON.parse(ret.value);
      this.generalService.token = user.token;
      this.generalService.access_id = user.access_id;
      // this.hasWorkspace = val.value;
      this.generalService.email = user.email;
      this.generalService.full_name = user.full_name;
      const initials = this.generalService.full_name?.split(' ').map((name: any) => name[0]).join('').toUpperCase();
      this.generalService.profileImageName = initials;
      await Preferences.set({key: 'current', value: userEmail});
      this.router.navigate(['home']);
      this.walletService.ngOnInit();
      this.subscriptionService.ngOnInit();
      this.workspaceService.getWorkspaces().subscribe(res => {
        if (res?.success) {
          this.workspaceService.workspaceList = res?.data?.workspaces;
        } else {
          if (res?.msg === 'Entry permit is not valid.' || res?.msg === 'Access information is not valid.') {
            this.userService.forceToLoginAgain();
          }
        }
      });
      this.generalService.saveToStorage('workspace', 'exist');
    }
  }

}

@Component({
  selector: 'add-account-dialog',
  templateUrl: 'add-account-dialog.html',
  standalone: true,
  imports: [FormsModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule],
  providers: [SidenavComponent]
})

export class AddAccountDialog {
  // @ViewChild('tabGroup') tabGroup: any;
  loading$ = this.loader.isLoading$;

  loading: boolean = false;
  loginForm = this._formBuilder.group({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });
  error: any;
  hide = true;

  constructor(public dialogRef: MatDialogRef<AddAccountDialog>,
              private _formBuilder: FormBuilder, public userService: UserService, private _snackBar: MatSnackBar,
              private generalService: GeneralService,
              private workspaceService: WorkspaceService,
              private router: Router, private loader: LoaderService,
              public sidenav: SidenavComponent, private walletService: WalletService,
              private subscriptionService: SubscriptionService) {
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';
      const data = await this.userService.login(this.loginForm.value)
        .catch(error => {
          this.loading = false;
          this.error = 'Something wrong happened! please try again...';
        });
      if (data?.success) {
        const secret = new TextEncoder().encode(data?.secret_key);
        const alg = 'HS256';

        const jwt = await new jose.SignJWT({'iss': 'PROMPTECH.ai', 'sub': (data?.access_id)})
          .setProtectedHeader({alg})
          .sign(secret);
        const elementExists = this.generalService.account.includes(this.loginForm.controls.email.value);
        if (!elementExists) {
          this.generalService.account.push(this.loginForm.controls.email.value);
        }
        await Preferences.set({key: 'account', value: JSON.stringify(this.generalService.account)});
        await this.generalService.setCurrentUserVariables(jwt, data.access_id, this.loginForm.controls.email.value, data?.name + ' ' + data?.family);
        this.userService.isLoggedIn = true;
        this.walletService.ngOnInit();
        this.subscriptionService.ngOnInit();
        this.loading = false;
        if (data?.workspace.length === 0) {
          this.generalService.hasWorkspace = false;
          this.workspaceService.workspaceList = [];
          await this.router.navigate(['plans']);
        } else {
          // this.workspaceService.workspaceList = data?.workspace;
          this.workspaceService.getWorkspaces().subscribe(res => {
            if (res?.success) {
              this.workspaceService.workspaceList = res?.data?.workspaces;
            } else {
              if (res?.msg === 'Entry permit is not valid.' || res?.msg === 'Access information is not valid.') {
                this.userService.forceToLoginAgain();
              }
            }
          })
          this.generalService.saveToStorage('workspace', 'exist');
          this.generalService.hasWorkspace = true;
          this.dialogRef.close();
          await this.router.navigate(['home']);
        }
      } else {
        this.loading = false;
        this.error = data?.msg;
      }
    }

  }
}

