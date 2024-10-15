import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {GeneralService} from "../general/general.service";
import {ConfigService} from "../config/config.service";
import {ProcessHTTPMsgService} from "../proccessHttpMsg/process-httpmsg.service";
import {delay, map, retryWhen, throwError} from "rxjs";
import {take} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class TutorialService {

  constructor(private http: HttpClient, private generalService: GeneralService,
              private config: ConfigService, private processHTTPMsgService: ProcessHTTPMsgService) { }

  async gameTutorialInit(): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    try {
      const response = this.http.get(this.config.url('tutorials/gameplay/init'), {
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

  async createTutorialGame(category: any, question: any, answer: any,): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    return this.http.post<any>(this.config.url('tutorials/gameplay/create'), {
      id: this.generalService.userId,
      category: category,
      question: question,
      answer: answer,
    }, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async gameTutorialStart(category: any, gameId: any,): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    return this.http.post<any>(this.config.url('tutorials/gameplay/start'), {
      id: this.generalService.userId,
      gameId: gameId,
    }, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async getTutorialGameQuestionBasedOnStep(gameId: any, step: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const maxRetries = 10; // Maximum number of retries
    const delayMs = 2000; // Delay between retries in milliseconds

    const response = this.http.get(this.config.url('tutorials/gameplay/' + gameId + '/question/' + step), {
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

  async sendTutorialAnswer(gameId: any, questionId: any, answer: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    return this.http.post<any>(this.config.url('tutorials/gameplay/submitAnswer'), {
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

  async sendTutorialRates(gameId: any, questionId: any, rates: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    return this.http.post<any>(this.config.url('tutorials/gameplay/rateAnswers'), {
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

  async sendTutorialRateQuestions(gameId: any, rates: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    return this.http.post<any>(this.config.url('tutorials/gameplay/rateQuestions'), {
      id: this.generalService.userId,
      gameId: gameId,
      rates: rates
    }, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }

  async getAllTutorialAnswersOfSpecificQuestion(gameId: any, questionId: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const maxRetries = 10; // Maximum number of retries
    const delayMs = 2000; // Delay between retries in milliseconds

    const response = this.http.get(this.config.url('tutorials/gameplay/' + gameId + '/' + questionId + '/answers'), {
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

  async getTutorialQuestionsOfGame(gameId: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const maxRetries = 10; // Maximum number of retries
    const delayMs = 2000; // Delay between retries in milliseconds

    const response = this.http.get(this.config.url('tutorials/gameplay/' + gameId + '/questions'), {
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


  async getTutorialGameResult(gameId: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })

    const maxRetries = 10; // Maximum number of retries
    const delayMs = 2000; // Delay between retries in milliseconds

    const response = this.http.get(this.config.url('tutorials/gameplay/' + gameId + '/result'), {
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


  async exitTutorialGame(gameId: any, useBeacon: boolean = false): Promise<any> {
    const url = this.config.url('tutorials/gameplay/leave');
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

}
