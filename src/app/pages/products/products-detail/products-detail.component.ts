import { NgClass, NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { Products, SizeElement } from '../../../core/models/products.model';
import { HttpService } from '../../../core/services/http.service';
import { UsersService } from '../../../users/users.service';

@Component({
  selector: 'app-products-detail',
  standalone: true,
  imports: [ UpperCasePipe, NgIf, NgFor, NgClass ],
  templateUrl: './products-detail.component.html',
  styleUrl: './products-detail.component.scss',
})
export class ProductsDetailComponent implements OnInit {
  productDetail: Products;
  selectedSizes: any[] = [];
  size: SizeElement[] = [];

  quantity: number = 1;
  constructor(
    private http: HttpService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private usersService: UsersService
  ) { }

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.route.params.subscribe((params) => {
      this.getProductDetail(params[ 'id' ]);
    });
  }
  getProductDetail(id: string): void {
    this.http.getProductsById(id).subscribe((product) => {
      this.productDetail = product;
      console.log(
        'this.http.getProductsById / this.productDetail:',
        this.productDetail
      );
    });
  }

  selectedSize(size: string): void {
    console.log('size', size);
    if (!this.selectedSizes) {
      this.selectedSizes = [];
    }

    const index = this.selectedSizes.indexOf(size);
    if (index === -1) {
      this.selectedSizes.push(size);
    } else {
      this.selectedSizes.splice(index, 1);
    }
    console.log('this.selectedSizes', this.selectedSizes);
  }

  increment(): void {
    this.quantity++;
  }
  decrement(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    // if (this.authService.isAuthenticated()) {
    this.size = [];
    this.selectedSizes.forEach((item) => {
      this.size.push({ size: item, quantity: this.quantity });
    })

    console.log('addToCart / size:', this.size);

    const data = {
      ...this.productDetail,
      size: this.size,
    }
    console.log("addToCart / data:", data);

    // this.usersService.createShoppingCart(data).subscribe({
    //   next: (cart) => {
    //     console.log('Cart created successfully:', cart);
    //   },
    //   error: (err) => {
    //     console.error('Error creating cart:', err);
    //   }
    // });
    // console.log("addToCart / data:", data);

    // console.log('addToCart / selectedSizes:', this.selectedSizes);
    // console.log('addToCart / quantity:', this.quantity);
    // } else {
    //   console.log('Please login to add to cart');
    // }
  }
}
