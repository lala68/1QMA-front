import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {FormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {GamesService} from "../../services/games/games.service";

@Component({
  selector: 'app-trivia-hub',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule],
  templateUrl: './trivia-hub.component.html',
  styleUrl: './trivia-hub.component.scss'
})
export class TriviaHubComponent implements OnInit {
  loading: boolean = true;

  constructor(private gameService: GamesService) {
  }

  async ngOnInit(): Promise<any> {

  }

}
