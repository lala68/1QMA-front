import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {GeneralService} from "../general/general.service";
import {ConfigService} from "../config/config.service";
import {delay, map, retryWhen, throwError} from "rxjs";
import {take} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class GamesService {

  constructor(private http: HttpClient, private generalService: GeneralService,
              private config: ConfigService,) {
  }

  async gameInit(): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    const response = this.http.get(this.config.url('game/init'), {
      headers: headers,
      withCredentials: true
    }).pipe(
      map((response: any) => response)
    ).toPromise();
    return response;
  }

  async createGame(gameType: any, createMode: any, category: any, players: any, question: any, answer: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    return this.http.post<any>(this.config.url('game/create'), {
      id: this.generalService.userId,
      gameType: gameType,
      createMode: createMode,
      category: category,
      players: players,
      question: question,
      answer: answer
    }, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async joinToGame(code: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    const response = this.http.get(this.config.url('game/' + code + '/join'), {
      headers: headers,
      withCredentials: true
    }).pipe(
      map((response: any) => response)
    ).toPromise();
    return response;
  }

  async findFriendGame(email: any, limit: any, page: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    const response = this.http.get(this.config.url('game/find/' + email + '/games'), {
      headers: headers,
      params: {limit, page},
      withCredentials: true
    }).pipe(
      map((response: any) => response)
    ).toPromise();
    return response;
  }

  async searchUserToInvite(text: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    const response = this.http.get(this.config.url('game/searchUsers'), {
      params: {search: text},
      headers: headers,
      withCredentials: true
    }).pipe(
      map((response: any) => response)
    ).toPromise();
    return response;
  }

  async joinGameWithMyQuestion(gameId: any, question: any, answer: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    return this.http.post<any>(this.config.url('game/join'), {
      id: this.generalService.userId,
      gameId: gameId,
      question: question,
      answer: answer
    }, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async getQuestionsOfGame(gameId: any): Promise<any> {
    // let headers = new HttpHeaders({
    //   'Content-Type': 'application/json',
    // })
    // const response = this.http.get(this.config.url('game/' + gameId + '/questions'), {
    //   headers: headers,
    //   withCredentials: true
    // }).pipe(
    //   map((response: any) => response)
    // ).toPromise();
    // return response;
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const maxRetries = 10; // Maximum number of retries
    const delayMs = 2000; // Delay between retries in milliseconds

    const response = this.http.get(this.config.url('game/' + gameId + '/questions'), {
      headers: headers,
      withCredentials: true
    }).pipe(
      map((response: any) => response),
      retryWhen(errors =>
        errors.pipe(
          delay(delayMs),
          take(maxRetries)
        )
      )
    ).toPromise().catch(error => {
      // Handle the error after retries are exhausted
      console.error('Failed to fetch answers after retries', error);
      return throwError(error);
    });

    return response;
  }

  async getGameQuestionBasedOnStep(gameId: any, step: any): Promise<any> {
    // let headers = new HttpHeaders({
    //   'Content-Type': 'application/json',
    // })
    // const response = this.http.get(this.config.url('game/' + gameId + '/question/' + step), {
    //   headers: headers,
    //   withCredentials: true
    // }).pipe(
    //   map((response: any) => response)
    // ).toPromise();
    // return response;
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const maxRetries = 10; // Maximum number of retries
    const delayMs = 2000; // Delay between retries in milliseconds

    const response = this.http.get(this.config.url('game/' + gameId + '/question/' + step), {
      headers: headers,
      withCredentials: true
    }).pipe(
      map((response: any) => response),
      retryWhen(errors =>
        errors.pipe(
          delay(delayMs),
          take(maxRetries)
        )
      )
    ).toPromise().catch(error => {
      // Handle the error after retries are exhausted
      console.error('Failed to fetch answers after retries', error);
      return throwError(error);
    });

    return response;
  }

  async sendAnswer(gameId: any, questionId: any, answer: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    return this.http.post<any>(this.config.url('game/submitAnswer'), {
      id: this.generalService.userId,
      gameId: gameId,
      questionId: questionId,
      answer: answer
    }, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async sendRates(gameId: any, questionId: any, rates: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    return this.http.post<any>(this.config.url('game/rateAnswers'), {
      id: this.generalService.userId,
      gameId: gameId,
      questionId: questionId,
      rates: rates
    }, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async sendRateQuestions(gameId: any, rates: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    return this.http.post<any>(this.config.url('game/rateQuestions'), {
      id: this.generalService.userId,
      gameId: gameId,
      rates: rates
    }, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  // async getAllAnswersOfSpecificQuestion(gameId: any, questionId: any): Promise<any> {
  //   let headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //   })
  //   const response = this.http.get(this.config.url('game/' + gameId + '/' + questionId + '/answers'), {
  //     headers: headers,
  //     withCredentials: true
  //   }).pipe(
  //     map((response: any) => response)
  //   ).toPromise();
  //   return response;
  // }
  async getAllAnswersOfSpecificQuestion(gameId: any, questionId: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const maxRetries = 10; // Maximum number of retries
    const delayMs = 2000; // Delay between retries in milliseconds

    const response = this.http.get(this.config.url('game/' + gameId + '/' + questionId + '/answers'), {
      headers: headers,
      withCredentials: true,
    }).pipe(
      map((response: any) => response),
      retryWhen(errors =>
        errors.pipe(
          delay(delayMs),
          take(maxRetries)
        )
      )
    ).toPromise().catch(error => {
      // Handle the error after retries are exhausted
      console.error('Failed to fetch answers after retries', error);
      return throwError(error);
    });

    return response;
  }

  async getGameResult(gameId: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    const response = this.http.get(this.config.url('game/' + gameId + '/result'), {
      headers: headers,
      withCredentials: true
    }).pipe(
      map((response: any) => response)
    ).toPromise();
    return response;
  }


  async exitGame(gameId: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    return this.http.post<any>(this.config.url('game/leave'), {
      id: this.generalService.userId,
      gameId: gameId
    }, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async invitePlayer(gameId: any, email: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    return this.http.post<any>(this.config.url('game/invitePlayer'), {
      id: this.generalService.userId,
      gameId: gameId,
      email: email
    }, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async getMyScoreboard(): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    const response = this.http.get(this.config.url('games/scoreboard'), {
      headers: headers,
      withCredentials: true
    }).pipe(
      map((response: any) => response)
    ).toPromise();
    return response;
  }

  async getLiveGames(): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    const response = this.http.get(this.config.url('games/live'), {
      params: {type: 'all'},
      headers: headers,
      withCredentials: true
    }).pipe(
      map((response: any) => response)
    ).toPromise();
    return response;
  }

  async getFriendsRecentGames(): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    const response = this.http.get(this.config.url('games/friendsRecent'), {
      headers: headers,
      withCredentials: true
    }).pipe(
      map((response: any) => response)
    ).toPromise();
    return response;
  }

  async getScoreboardSurvival(): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    const response = this.http.get(this.config.url('games/scoreboard/survival'), {
      headers: headers,
      withCredentials: true
    }).pipe(
      map((response: any) => response)
    ).toPromise();
    return response;
  }

  async getLiveSurvival(): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    const response = this.http.get(this.config.url('games/live/survival'), {
      headers: headers,
      withCredentials: true
    }).pipe(
      map((response: any) => response)
    ).toPromise();
    return response;
  }

  async getFriendsRecentSurvival(): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    const response = this.http.get(this.config.url('games/friendsRecent/survival'), {
      headers: headers,
      withCredentials: true
    }).pipe(
      map((response: any) => response)
    ).toPromise();
    return response;
  }

}
