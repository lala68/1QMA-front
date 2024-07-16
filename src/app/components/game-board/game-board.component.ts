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
import {MatExpansionModule} from "@angular/material/expansion";
import {ConfigService} from "../../services/config/config.service";

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, ReactiveFormsModule, TranslateModule,
    ClipboardModule, CountdownTimerComponent, CdkDropList, CdkDrag, MatExpansionModule],
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
  filteredEmails: any = [];

  constructor(public generalService: GeneralService, private router: Router, private gameService: GamesService,
              public configService: ConfigService) {
    this.data = this.router.getCurrentNavigation()?.extras?.state?.['data'];
    this.users = this.router.getCurrentNavigation()?.extras?.state?.['users'];
  }

  async ngOnInit() {
    this.generalService?.players.push(this.data?.game?.gameCreator);
  }

  inviteUser() {
    if (this.invitedUser && this.invitedUser?.length > 2) {
      this.gameService.searchUserToInvite(this.invitedUser).then(data => {
        this.filteredEmails = (data.data);
      })
    }
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
        this.loading = false;
        this.generalService.editingAnswer = true;
      } else {
        this.loading = false;
      }
    })
  }

  drop(event: CdkDragDrop<any[]>) {
    // Update the order of answers array
    moveItemInArray(this.generalService.specificQuestionAnswers.answers, event.previousIndex, event.currentIndex);
    // moveItemInArray(this.questions, event.previousIndex, event.currentIndex);

    // Update the rates array based on the new order of answers
    this.updateRates(true);
  }

  moveUpAnswers(index: number) {
    if (index > 0) {
      const temp = this.generalService.specificQuestionAnswers.answers[index];
      this.generalService.specificQuestionAnswers.answers[index] = this.generalService.specificQuestionAnswers.answers[index - 1];
      this.generalService.specificQuestionAnswers.answers[index - 1] = temp;
    }
  }

  moveDownAnswers(index: number) {
    if (index < this.generalService.specificQuestionAnswers.answers.length - 1) {
      const temp = this.generalService.specificQuestionAnswers.answers[index];
      this.generalService.specificQuestionAnswers.answers[index] = this.generalService.specificQuestionAnswers.answers[index + 1];
      this.generalService.specificQuestionAnswers.answers[index + 1] = temp;
    }
  }

  moveUpQuestions(index: number) {
    if (index > 0) {
      const temp = this.generalService.allQuestions[index];
      this.generalService.allQuestions[index] = this.generalService.allQuestions[index - 1];
      this.generalService.allQuestions[index - 1] = temp;
    }
  }

  moveDownQuestions(index: number) {
    if (index < this.generalService.allQuestions.length - 1) {
      const temp = this.generalService.allQuestions[index];
      this.generalService.allQuestions[index] = this.generalService.allQuestions[index + 1];
      this.generalService.allQuestions[index + 1] = temp;
    }
  }

  dropQuestions(event: CdkDragDrop<any[]>) {
    // Update the order of answers array
    moveItemInArray(this.generalService.allQuestions, event.previousIndex, event.currentIndex);

    // Update the rates array based on the new order of answers
    this.updateRatesQuestions(true);
  }

  updateRates(dropped: boolean = false) {
    if (!dropped) {
      this.generalService.rateAnswers = this.generalService.specificQuestionAnswers.answers.map((answer: any, index: any) => ({
        answer_id: answer._id,
        rate: '1.1' // Assuming the rate is the new index + 1 as a string
      }));
    } else {
      this.generalService.rateAnswers = this.generalService.specificQuestionAnswers.answers.map((answer: any, index: any) => ({
        answer_id: answer._id,
        rate: (index + 1).toString() // Assuming the rate is the new index + 1 as a string
      }));
    }
  }

  updateRatesQuestions(dropped: boolean = false) {
    if (!dropped) {
      this.generalService.rateQuestions = this.generalService.allQuestions.map((question: any, index: any) => ({
        question_id: question._id,
        rate: '1.1' // Assuming the rate is the new index + 1 as a string
      }));
    } else {
      this.generalService.rateQuestions = this.generalService.allQuestions.map((question: any, index: any) => ({
        question_id: question._id,
        rate: (index + 1).toString() // Assuming the rate is the new index + 1 as a string
      }));
    }
  }

  async sendRateAnswer(): Promise<any> {
    this.generalService.nextButtonDisable = true;
    this.gameService.sendRates(this.generalService.createdGameData.game.gameId, this.generalService.gameQuestion._id, this.generalService.rateAnswers).then(data => {
      if (data.status == 1) {
        this.loading = false;
      } else {
        this.loading = false;
      }
    })
  }

  async sendRateQuestions(): Promise<any> {
    this.generalService.nextButtonDisable = true;
    this.gameService.sendRateQuestions(this.generalService.createdGameData.game.gameId, this.generalService.rateQuestions).then(data => {
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

  removeFromInvited(email: any) {
    const index = this.generalService.invitedPlayersArray.findIndex((data: any) => data === email);
    if (index !== -1) {
      // Remove the item from the array
      this.generalService.invitedPlayersArray.splice(index, 1);
    }
  }

  newGame() {

  }

  selectUserToInvite(user: any) {
    this.invitedUser = user;
    this.filteredEmails = [];
  }

  addUserToPlayers() {
    this.generalService.invitedPlayersArray.push(this.invitedUser);
    this.invitedUser = '';
  }
}
