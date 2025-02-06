import { UpperCasePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { Product, ShoppingCart } from '../../core/models/cart.model';
import { Users } from '../../core/models/user.model';
import { UsersService } from '../../users/users.service';
import { ModalService } from './product-modal-service.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [ DialogModule, UpperCasePipe, ButtonModule ],
  templateUrl: './product-modal.component.html',
  styleUrl: './product-modal.component.scss',
})
export class ProductModal implements OnInit, OnDestroy {
  @Input() currentProduct: Product;
  visible: boolean = false;
  quantitySize: number = 1;
  totalProduct: number = 0;
  user: Users;
  shoppingCart: ShoppingCart;
  subscription: Subscription;

  constructor(
    private modalService: ModalService,
    private authService: AuthService,
    private usersService: UsersService
  ) { }


  ngOnInit(): void {
    this.getData();
    this.getSubscriptions()

  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getData() {
    this.modalService.openModal$.subscribe((product) => {
      if (product && product.properties && product.properties.length > 0) {
        this.currentProduct = product;
        this.visible = true;
      }
    });

    if (this.authService.isAuthenticated()) {
      this.user = this.authService.getSessionStorage('user');
      this.usersService
        .getShoppingCartByUserId(this.user.userId)
        .subscribe((shoppingCart: any) => {
          this.shoppingCart = shoppingCart[0];

        });
    }

  }

  getSubscriptions() {
    this.subscription = this.modalService.openModal$.subscribe((product) => {
      if (product && product.properties && product.properties.length > 0) {
        this.currentProduct = product;

      }
    });
    this.subscription.add(this.usersService.shoppingCart$.subscribe((shoppingCart: any) => {
      this.shoppingCart = shoppingCart;
    }))
    this.subscription.add(this.authService.user$.subscribe((user) => {
      this.user = user;
    }))
  }
  addProductToNewCart() {

    const productExists = this.shoppingCart?.products.some(
      (product) => product.id === this.currentProduct.id
    );

    const payload = {
      id: this.shoppingCart?.id || '0',
      userId: this.authService.isAuthenticated() ? this.user.userId : 0,
      date: new Date(),
      cartId: this.shoppingCart?.cartId || 0,
      products: productExists
        ? this.shoppingCart.products
        : [ ...(this.shoppingCart?.products || []), this.currentProduct ],
    };

    console.log('payload', payload);
    this.shoppingCart = payload;
    this.visible = false;
    this.usersService.shoppingCart$.next(payload);
    this.usersService.putShoppingCart(payload.id, payload).subscribe((cart) => {
      console.log('cart', cart);
    })
  }
}
