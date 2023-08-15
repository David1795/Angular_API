import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse,HttpStatusCode } from '@angular/common/http';
import { retry,catchError,map } from 'rxjs/operators';
import { throwError,zip } from 'rxjs';

import { Product, CreateProduct, UpdateProduct } from './../models/product.model';
import { checkTime } from './../interceptors/time.interceptor'

import { environment } from './../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private apiUrl = `${environment.API_URL}/api/products`;

  constructor(
    private http: HttpClient

  ) { }

  getAllProducts(limit? : number, offset?: number) {
    let params = new HttpParams();
    if( limit&&offset ){
      params = params.set('limit', limit);
      params = params.set('offset', offset);
    }
    return this.http.get<Product[]>(this.apiUrl, { params, context: checkTime()})
      .pipe(
        retry(3),
        map( products => products.map( product => {
          return {
          ...product,
          taxes: .19 * product.price
         }
        }))
      );
  }

  fetchReadAndUpdate(id:string, data: UpdateProduct){
    return zip(
      this.getProduct(id),
      this.update(id, data)
    )

  }

  getProduct(id: string) {
    return this.http.get<Product>(`${this.apiUrl}/${id}`)
    .pipe(
      catchError((error: HttpErrorResponse) => {
        if(error.status === HttpStatusCode.Conflict){
          return throwError('error interno en el servidor');
        }
        if(error.status === HttpStatusCode.NotFound){
          return throwError('el producto no existe');
        }
        if(error.status === HttpStatusCode.Unauthorized){
          return throwError('No esta autorizado');
        }
        return throwError('algo salio mal');
       })
    )
  }

  getProductsByPage(limit : number, offset: number){
    return this.http.get<Product[]>(`${this.apiUrl}`,{
     params: { limit,offset } })
     .pipe(
      retry(3),
      map( products => products.map( product => {
        return {
        ...product,
        taxes: .19 * product.price
       }
      }))
    );
    };

  create( data: CreateProduct) {
    return this.http.post<Product>(this.apiUrl, data);
  }

  update( id: string, data: UpdateProduct ){
    return this.http.put<Product>(`${this.apiUrl}/${id}`, data);
  }

  delete( id: string ){
    return this.http.get<boolean>(`${this.apiUrl}/${id}`);
  }

}
