import { Component, OnInit } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { zip } from 'rxjs'

import { Product, CreateProduct, UpdateProduct } from '../../models/product.model';

import { StoreService } from '../../services/store.service';
import { ProductsService } from '../../services/products.service';


@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  myShoppingCart: Product[] = [];
  total = 0;
  products: Product[] = [];
  showProductDetail = false;
  productChosen: Product = {
    id: '',
    price: 0,
    images: [],
    title: '',
    category: {
      id: '',
      name: ''

    },
    description: ''
  };
  limit = 10;
  offset = 0;
  statusDetails : 'loading' | 'success' | 'error' | 'init' = 'init' ;

  constructor(
    private storeService: StoreService,
    private productsService: ProductsService
  ) {
    this.myShoppingCart = this.storeService.getShoppingCart();
  }

  ngOnInit(): void {
    this.productsService.getProductsByPage(10,0)
    .subscribe(data => {
      this.products = data;
    });
  }

  onAddToShoppingCart(product: Product) {
    this.storeService.addProduct(product);
    this.total = this.storeService.getTotal();
  }

  toggleProductDetail() {
    this.showProductDetail = !this.showProductDetail;
  }

  onShowDetail(id : string){
    this.statusDetails = 'loading';
    this.toggleProductDetail();
    this.productsService.getProduct(id)
    .subscribe(data => {
      this.productChosen = data;
      this.statusDetails = 'success';
    }, errorMsg => {
        window.alert(errorMsg);
        this.statusDetails = 'error';
    })
  }

  readAndUpdate(id: string){
    this.productsService.getProduct(id)
    .pipe(
      switchMap((product) =>
         this.productsService.update(product.id,{title : 'Nike Air Max'})
      )
    )
    .subscribe(data => {
      console.log(data);
    })
    this.productsService.fetchReadAndUpdate(id ,{title : 'Nike Air Max'})
    .subscribe(response => {
      const red = response[0];
      const update = response[1];
    })
  }

  createNewProduct(){
    const product : CreateProduct = {
      title: 'Nuevo producto',
      description: 'Hola' ,
      price: 1000,
      images: [`https://placeimg.com/640/480/any?random=${Math.random()}`],
      categoryId: 2,
    }
    this.productsService.create(product)
    .subscribe(data => {
      this.products.unshift(data);
    })
  }

  updateProduct(){
    const changes : UpdateProduct = {
      title: 'Adidas Zamba'
    }
    const id = this.productChosen.id;
    this.productsService.update(id, changes)
    .subscribe(data => {
      const productIndex = this.products.findIndex(product => product.id === id);
      this.products[productIndex] = data;
    })
  }

  deleteProduct(){
    const id = this.productChosen.id;
    this.productsService.delete(id)
    .subscribe(() => {
      const productIndex = this.products.findIndex(product => product.id === id);
      this.products.splice(productIndex , 1)
      this.showProductDetail = false;
    })
  }

  loadMore(){
    this.productsService.getProductsByPage(this.limit, this.offset)
    .subscribe(data => {
      this.products = this.products.concat(data);
      this.offset += this.limit;
    });
  }

}
