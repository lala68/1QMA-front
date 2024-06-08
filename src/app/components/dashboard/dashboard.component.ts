import { Component } from '@angular/core';
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SharedModule,],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
