import {Component, CUSTOM_ELEMENTS_SCHEMA, Inject} from '@angular/core';
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {LoaderService} from "../../services/loader/loader.service";
import {AuthService} from "../../services/auth/auth.service";
import {SharedModule} from "../../shared/shared.module";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {MaterialModule} from "../../shared/material/material.module";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, ReactiveFormsModule, RouterModule, MaterialModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginComponent {
  loading$ = this.loader.isLoading$;
  loading: boolean = false;
  loginForm = this._formBuilder.group({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });
  error: any;
  hide = true;

  constructor(private _formBuilder: FormBuilder,private loader: LoaderService,
              public authService: AuthService) {
  }

  onSubmit() {

  }

}
