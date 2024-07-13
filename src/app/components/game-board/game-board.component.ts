import {Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Router, RouterModule} from "@angular/router";
import {SharedModule} from "../../shared/shared.module";
import {TranslateModule} from "@ngx-translate/core";
import {GeneralService} from "../../services/general/general.service";
import {ClipboardModule} from "@angular/cdk/clipboard";
import {CountdownTimerComponent} from "../countdown-timer/countdown-timer.component";
import {GamesService} from "../../services/games/games.service";
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray} from "@angular/cdk/drag-drop";

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, ReactiveFormsModule, TranslateModule,
    ClipboardModule, CountdownTimerComponent, CdkDropList, CdkDrag],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss',
  providers: [CountdownTimerComponent]
})
export class GameBoardComponent implements OnInit {
  @ViewChild('answerTextArea') answerTextArea: any;
  @ViewChild(CountdownTimerComponent) countdownTimer: any;
  loading: boolean = false;
  data: any;
  users: any;
  invitedUser: any;
  wordCountAnswer: number = 100;
  rates: { answer_id: string, rate: string }[] = [];
  rateQuestions: { question_id: string, rate: string }[] = [];

  constructor(public generalService: GeneralService, private router: Router, private gameService: GamesService) {
    this.data = this.router.getCurrentNavigation()?.extras?.state?.['data'];
    this.users = this.router.getCurrentNavigation()?.extras?.state?.['users'];
  }

  async ngOnInit() {
    this.generalService?.players.push(this.data?.game?.gameCreator);
  }

  inviteUser() {

  }

  handleCountdownFinished() {
    this.generalService.finishedTimer = true;
  }

  restartCountdown() {
    this.countdownTimer.startCountdown();
  }

  async sendAnswer(): Promise<any> {
    this.generalService.nextButtonDisable = true;
    this.gameService.sendAnswer(this.generalService.createdGameData.game.gameId, this.generalService.gameQuestion._id, this.generalService.gameAnswerGeneral).then(data => {
      if (data.status == 1) {
        this.generalService.gameAnswerGeneral = '';
        this.loading = false;
      } else {
        this.loading = false;
      }
    })
  }

  drop(event: CdkDragDrop<any[]>) {
    // Update the order of answers array
    moveItemInArray(this.generalService.specificQuestionAnswers.answers, event.previousIndex, event.currentIndex);

    // Update the rates array based on the new order of answers
    this.updateRates();
  }

  dropQuestions(event: CdkDragDrop<any[]>) {
    // Update the order of answers array
    moveItemInArray(this.generalService.allQuestions, event.previousIndex, event.currentIndex);

    // Update the rates array based on the new order of answers
    this.updateRatesQuestions();
  }

  updateRates() {
    this.rates = this.generalService.specificQuestionAnswers.answers.map((answer: any, index: any) => ({
      answer_id: answer._id,
      rate: (index + 1).toString() // Assuming the rate is the new index + 1 as a string
    }));
  }

  updateRatesQuestions() {
    this.rateQuestions = this.generalService.allQuestions.map((question: any, index: any) => ({
      question_id: question._id,
      rate: (index + 1).toString() // Assuming the rate is the new index + 1 as a string
    }));
  }

  async sendRateAnswer(): Promise<any> {
    this.generalService.nextButtonDisable = true;
    this.gameService.sendRates(this.generalService.createdGameData.game.gameId, this.generalService.gameQuestion._id, this.rates).then(data => {
      if (data.status == 1) {
        this.loading = false;
      } else {
        this.loading = false;
      }
    })
  }

  async sendRateQuestions(): Promise<any> {
    this.generalService.nextButtonDisable = true;
    this.gameService.sendRateQuestions(this.generalService.createdGameData.game.gameId, this.rateQuestions).then(data => {
      if (data.status == 1) {
        this.loading = false;
      } else {
        this.loading = false;
      }
    })
  }

  updateWordCountAnswer() {
    this.wordCountAnswer = this.generalService?.gameAnswerGeneral ? (100 - this.generalService?.gameAnswerGeneral.trim().split(/\s+/).length) : 100;
  }

  editAnswer() {
    this.generalService.editingAnswer = false;
  }
}
