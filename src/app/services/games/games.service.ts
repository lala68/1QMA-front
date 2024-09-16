import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {GeneralService} from "../general/general.service";
import {ConfigService} from "../config/config.service";
import {delay, map, retryWhen, throwError} from "rxjs";
import {take} from "rxjs/operators";
import {ProcessHTTPMsgService} from "../proccessHttpMsg/process-httpmsg.service";

@Injectable({
  providedIn: 'root'
})
export class GamesService {

  constructor(private http: HttpClient, private generalService: GeneralService,
              private config: ConfigService, private processHTTPMsgService: ProcessHTTPMsgService) {
  }

  async gameInit(): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    try {
      const response = this.http.get(this.config.url('game/init'), {
        headers: headers,
        withCredentials: true
      }).pipe(
        map((response: any) => response)
      ).toPromise();
      return response;
    } catch (error) {
      // Use ProcessHTTPMsgService to handle the error
      return this.processHTTPMsgService.handleError(error);
    }
  }

  async createGame(gameType: any, createMode: any, category: any, players: any, question: any, answer: any,
                   questionId: any): Promise<any> {
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
      answer: answer,
      questionId: questionId
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

  async getAllOrMyGames(type: any, category: any, limit: any, page: any, sort: any = ''): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    const response = this.http.get(this.config.url('games'), {
      headers: headers,
      params: {type: type, category: category, limit, page, sort},
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

  async joinGameWithMyQuestion(gameId: any, question: any, answer: any, questionId: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    return this.http.post<any>(this.config.url('game/join'), {
      id: this.generalService.userId,
      gameId: gameId,
      question: question,
      answer: answer,
      questionId: questionId
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

  async editAnswer(gameId: any, questionId: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    return this.http.post<any>(this.config.url('game/editAnswer'), {
      id: this.generalService.userId,
      gameId: gameId,
      questionId: questionId,
    }, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
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

    const maxRetries = 10; // Maximum number of retries
    const delayMs = 2000; // Delay between retries in milliseconds

    const response = this.http.get(this.config.url('game/' + gameId + '/result'), {
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


  async exitGame(gameId: any, useBeacon: boolean = false): Promise<any> {
    const url = this.config.url('game/leave');
    const data = {
      id: this.generalService.userId,
      gameId: gameId
    };

    if (useBeacon) {
      // Use navigator.sendBeacon when useBeacon is true
      const payload = JSON.stringify(data);
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(url, blob);

      // Return a resolved promise for consistency
      return Promise.resolve();
    } else {
      // Default to the original method if not using beacon
      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
      });

      return this.http.post<any>(url, data, {
        headers: headers,
        withCredentials: true
      }).toPromise();
    }
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

  async getLiveGames(category: any = ''): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    const response = this.http.get(this.config.url('games/live'), {
      params: {category: category},
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

  async getLiveSurvival(category: any = ''): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    const response = this.http.get(this.config.url('games/live/survival'), {
      params: {category: category},
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

  async keepMyScore(gameId: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    return this.http.post<any>(this.config.url('game/keepMyScore'), {
      id: this.generalService.userId,
      gameId: gameId,
    }, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async backToCheckpoint(gameId: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    return this.http.post<any>(this.config.url('game/backToCheckpoint'), {
      id: this.generalService.userId,
      gameId: gameId,
    }, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

}
