import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {GeneralService} from "./general/general.service";
import {ConfigService} from "./config/config.service";
import {ProcessHTTPMsgService} from "./proccessHttpMsg/process-httpmsg.service";
import {map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ShopService {

  constructor(private http: HttpClient, private generalService: GeneralService,
              private config: ConfigService, private processHTTPMsgService: ProcessHTTPMsgService) {
  }

  async getShops(type: any = null, page: any, limit: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    try {
      const response = this.http.get(this.config.url('shop'), {
        params: {type, page, limit},
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

  async payWithCoin(shopId: any): Promise<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',

    })
    return this.http.post<any>(this.config.url('shop/payWithCoin'), {
      id: this.generalService.userId,
      shopItemId: shopId
    }, {
      headers: headers,
      withCredentials: true
    })
      .toPromise();
  }
}
