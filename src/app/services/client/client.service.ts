import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {GeneralService} from "../general/general.service";
import {ConfigService} from "../config/config.service";
import {map, Observable, switchMap} from "rxjs";
import {ProcessHTTPMsgService} from "../proccessHttpMsg/process-httpmsg.service";

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private http: HttpClient, private generalService: GeneralService,
              private config: ConfigService, private processHTTPMsgService: ProcessHTTPMsgService) {
  }

  async clientInit(): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    try {
      const response = this.http.get(this.config.url('client/init'), {
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

  async updateProfileClient(data: any, userId: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    try {
      const response = this.http.post<any>(this.config.url('client/profile/update'), {id: userId, ...data}, {
        headers: headers,
        withCredentials: true
      })
        .toPromise();
      return response;
    } catch (error) {
      // Use ProcessHTTPMsgService to handle the error
      return this.processHTTPMsgService.handleError(error);
    }
  }

  async updateSettings(data: any, userId: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    try {
      const response = this.http.post<any>(this.config.url('client/settings/update'), {id: userId, ...data}, {
        headers: headers,
        withCredentials: true
      })
        .toPromise();
      return response;
    } catch (error) {
      // Use ProcessHTTPMsgService to handle the error
      return this.processHTTPMsgService.handleError(error);
    }
  }

  async inviteFriend(data: any, userId: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    try {
      const response = this.http.post<any>(this.config.url('client/invite'), {id: userId, email: data.email}, {
        headers: headers,
        withCredentials: true
      })
        .toPromise();
      return response;
    } catch (error) {
      // Use ProcessHTTPMsgService to handle the error
      return this.processHTTPMsgService.handleError(error);
    }
  }

  async postProfilePicture(data: any): Promise<any> {
    let headers = new HttpHeaders({});

    const formData = new FormData();
    formData.append('id', this.generalService.userId);
    formData.append('avatar', data);

    try {
      const response = this.http.post<any>(this.config.url('client/profilePicture/update'), formData, {
        headers: headers,
        withCredentials: true
      })
        .toPromise();
      return response;
    } catch (error) {
      // Use ProcessHTTPMsgService to handle the error
      return this.processHTTPMsgService.handleError(error);
    }
  }

  async removeProfilePicture(): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    try {
      const response = this.http.post<any>(this.config.url('client/profilePicture/remove'), {id: this.generalService.userId}, {
        headers: headers,
        withCredentials: true
      })
        .toPromise();
      return response;
    } catch (error) {
      // Use ProcessHTTPMsgService to handle the error
      return this.processHTTPMsgService.handleError(error);
    }
  }

  async addQuestion(data: any, category: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    try {
      const response = this.http.post<any>(this.config.url('client/questions/add'), {
        id: this.generalService.userId,
        ...data, category: category
      }, {
        headers: headers,
        withCredentials: true
      })
        .toPromise();
      return response;
    } catch (error) {
      // Use ProcessHTTPMsgService to handle the error
      return this.processHTTPMsgService.handleError(error);
    }
  }

  async getUserQuestions(category: any = '', type: any = '', search: any = '', page: any = 1, limit: any = 10, sort: any = ''): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    try {
      const response = this.http.get(this.config.url('client/questions'), {
        params: {category: category, type: type, search: search, page, limit, sort},
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

  async getUserById(id: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    try {
      const response = this.http.get(this.config.url('client/' + id + '/details'), {
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

  uploadImage(imagePath: string): Observable<any> {
    return this.http.get(imagePath, {responseType: 'blob'}).pipe(
      switchMap((blob: Blob) => {
        const formData = new FormData();
        formData.append('id', this.generalService.userId);
        formData.append('avatar', blob, 'image.png');

        return this.http.post<any>(this.config.url('client/profilePicture/update'), formData, {
          withCredentials: true
        })
          .toPromise();
      })
    );
  }

  async getMyOrAllQuestions(type: any, category: any, limit: any, page: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    try {
      const response = this.http.get(this.config.url('client/topQuestions'), {
        headers: headers,
        params: {type: type, category: category, limit, page},
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

  async getQuestionsFromFriendsLatestGames(limit: any, page: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    try {
      const response = this.http.get(this.config.url('client/questionsFromFriendsLatestGames'), {
        headers: headers,
        params: {limit, page},
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

  async getQuestionPerformance(id: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    try {
      const response = this.http.get(this.config.url('client/questions/' + id + '/performance'), {
        headers: headers,
        params: {id: id},
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

  async likeQuestion(questionId: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    try {
      const response = this.http.post<any>(this.config.url('client/questions/like'), {
        id: this.generalService.userId,
        questionId: questionId
      }, {
        headers: headers,
        withCredentials: true
      })
        .toPromise();
      return response;
    } catch (error) {
      // Use ProcessHTTPMsgService to handle the error
      return this.processHTTPMsgService.handleError(error);
    }
  }

  async disLikeQuestion(questionId: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    try {
      const response = this.http.post<any>(this.config.url('client/questions/dislike'), {
        id: this.generalService.userId,
        questionId: questionId
      }, {
        headers: headers,
        withCredentials: true
      })
        .toPromise();
      return response;
    } catch (error) {
      // Use ProcessHTTPMsgService to handle the error
      return this.processHTTPMsgService.handleError(error);
    }
  }

  async bookmarkQuestion(questionId: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    try {
      const response = this.http.post<any>(this.config.url('client/questions/bookmark'), {
        id: this.generalService.userId,
        questionId: questionId
      }, {
        headers: headers,
        withCredentials: true
      })
        .toPromise();
      return response;
    } catch (error) {
      // Use ProcessHTTPMsgService to handle the error
      return this.processHTTPMsgService.handleError(error);
    }
  }

  async removeBookmarkQuestion(questionId: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    try {
      const response = this.http.post<any>(this.config.url('client/questions/removeBookmark'), {
        id: this.generalService.userId,
        questionId: questionId
      }, {
        headers: headers,
        withCredentials: true
      })
        .toPromise();
      return response;
    } catch (error) {
      // Use ProcessHTTPMsgService to handle the error
      return this.processHTTPMsgService.handleError(error);
    }
  }

  async getTransactions(limit: any, page: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    try {
      const response = this.http.get(this.config.url('client/Transactions'), {
        headers: headers,
        params: {limit, page},
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

  async postCharity(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    try {
      const response = this.http.post<any>(this.config.url('client/charity'), {
        id: this.generalService.userId,
        charity: data.charity,
        activity: data.activity
      }, {
        headers: headers,
        withCredentials: true
      })
        .toPromise();
      return response;
    } catch (error) {
      // Use ProcessHTTPMsgService to handle the error
      return this.processHTTPMsgService.handleError(error);
    }
  }

  async postBugReport(data: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    try {
      const response = this.http.post<any>(this.config.url('client/bugReports/add'), {
        ...data
      }, {
        headers: headers,
        withCredentials: true
      })
        .toPromise();
      return response;
    } catch (error) {
      // Use ProcessHTTPMsgService to handle the error
      return this.processHTTPMsgService.handleError(error);
    }
  }

  async getFaqs(): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    try {
      const response = this.http.get(this.config.url('client/faqs'), {
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

  async getPrivacy(): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    try {
      const response = this.http.get(this.config.url('client/privacyPolicies'), {
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

  async getTerms(): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    try {
      const response = this.http.get(this.config.url('client/termsOfService'), {
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


}
