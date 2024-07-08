import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {GeneralService} from "../general/general.service";
import {ConfigService} from "../config/config.service";
import {map} from "rxjs";

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

  async findFriendGame(email: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    const response = this.http.get(this.config.url('game/find/' + email + '/games'), {
      headers: headers,
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
}
