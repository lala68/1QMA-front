import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router, RouterModule} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {GeneralService} from "../../services/general/general.service";
import {GamesService} from "../../services/games/games.service";

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, ReactiveFormsModule,
    TranslateModule],
  templateUrl: './games.component.html',
  styleUrl: './games.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class GamesComponent implements OnInit {
  loading: boolean = true;
  createGameStep: any = 1;
  data: any;
  selectedGameMode: any;
  selectedGameType: any = [];
  selectedCategory: any = [];
  inviteForm = this._formBuilder.group({
    email: new FormControl('', [Validators.required, Validators.email]),
  });
  invitedArray: any = [];
  wordCount: number = 100;
  wordCountAnswer: number = 100;
  questionForm = this._formBuilder.group({
    question: new FormControl('', [Validators.required]),
    answer: new FormControl('', [Validators.required]),
  });

  constructor(public generalService: GeneralService, private gameService: GamesService,
              private _formBuilder: FormBuilder, private router: Router) {
    this.generalService.currentRout = '/games';
  }

  async ngOnInit(): Promise<any> {
    this.gameService.gameInit().then(data => {
      if (data.status == 1) {
        this.data = data.data;
        this.loading = false;
      }
    })
  }

  async gotoStepTwo(index: any) {
    this.selectedGameMode = index;
    this.createGameStep = 2;
  }

  async startingGame() {
    this.generalService.startingGame = true;
    await this.router.navigate(['/game-board']);
  }

  isSelectedGameType(item: any): boolean {
    return this.selectedGameType.some((game: any) => game === item);
  }

  selectGameType(item: any) {
    this.selectedGameType = [];
    this.selectedGameType.push(item);
  }

  isSelected(item: any): boolean {
    return this.selectedCategory.some((category: any) => category._id === item._id);
  }

  selectCat(item: any) {
    console.log(this.selectedCategory)
    const index = this.selectedCategory.findIndex((data: any) => data._id === item._id);
    console.log(index)
    if (index !== -1) {
      // Remove the item from the array
      this.selectedCategory.splice(index, 1);
    } else {
      this.selectedCategory.push(item);
    }
  }

  onSubmitInvite() {
    const index = this.invitedArray.findIndex((data: any) => data === this.inviteForm.controls.email.value);
    if (index !== -1) {
      // Remove the item from the array
    } else {
      this.invitedArray.push(this.inviteForm.controls.email.value);
      this.inviteForm.reset();
    }
  }

  removeInvite(item: any) {
    const index = this.invitedArray.findIndex((data: any) => data === item);
    if (index !== -1) {
      // Remove the item from the array
      this.invitedArray.splice(index, 1);
    }
  }

  updateWordCount() {
    this.wordCount = this.questionForm.controls.question.value ? (100 - this.questionForm.controls.question.value.trim().split(/\s+/).length) : 100;
  }

  updateWordCountAnswer() {
    this.wordCountAnswer = this.questionForm.controls.answer.value ? (100 - this.questionForm.controls.answer.value.trim().split(/\s+/).length) : 100;
  }
}
