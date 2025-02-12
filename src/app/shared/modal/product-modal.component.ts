import { NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Subscription, tap } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { Product, ShoppingCart } from '../../core/models/cart.model';
import { Users } from '../../core/models/user.model';
import { UsersService } from '../../users/users.service';
import { ModalService } from './product-modal-service.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [ DialogModule, UpperCasePipe, ButtonModule, NgIf, NgFor ],
  templateUrl: './product-modal.component.html',
  styleUrl: './product-modal.component.scss',
})
export class ProductModal implements OnInit, OnDestroy {
  @Input() currentProduct: Product;
  visible: boolean = false;
  quantitySize: number = 1;
  totalProduct: number = 0;
  user: Users;
  shoppingCart: ShoppingCart = {
    id: '0',
    userId: null,
    date: new Date(),
    products: [],
    cartId: 0,
  };
  subscription: Subscription;
  cart: any

  constructor(
    private modalService: ModalService,
    private authService: AuthService,
    private usersService: UsersService
  ) {

  }

  ngOnInit(): void {
    this.getData();
    this.getSubscriptions();
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
  }

  getSubscriptions() {
    this.subscription = this.modalService.openModal$.subscribe((product) => {
      if (product && product.properties && product.properties.length > 0) {
        this.currentProduct = product;
      }
    });

  }
  addProductToNewCart() {

    this.checkUserCartStatus()
  }


  decrementQuantity(currentProduct: Product, size: any): void {
    console.log("decrementQuantity / currentProduct:", currentProduct);

    currentProduct.properties.forEach((property) => {
      property?.size?.forEach((s: any) => {
        if (s.quantity <= 0) return;
        if (s.size === size.size) {
          s.quantity -= 1;
          property.quantity -= 1;
        }
      })
    })

    this.totalProduct = currentProduct.properties.reduce((total, property) => {
      return total + (property?.size ? property.size.reduce((sizeTotal, s) => sizeTotal + s.quantity, 0) : 0);
    }, 0);

    this.usersService.selectedProduct.set(currentProduct);
  }
  incrementQuantity(currentProduct: Product, size: any) {

    currentProduct.properties.forEach((property) => {
      property?.size?.forEach((s: any) => {
        if (s.quantity <= 0) return;
        if (s.size === size.size) {
          s.quantity += 1;
          property.quantity += 1;
        }
      })
    })

    this.totalProduct = currentProduct.properties.reduce((total, property) => {
      return total + (property?.size ? property.size.reduce((sizeTotal, s) => sizeTotal + s.quantity, 0) : 0);
    }, 0);
    this.usersService.selectedProduct.set(currentProduct);

  }

  checkUserCartStatus(): number {
    const isAuthenticated = this.authService.isAuthenticated();
    const localCart = this.authService.getLocalStorage('shoppingCart');
    let DBCart: any = [];

    if (isAuthenticated) {
      const user = this.authService.getSessionStorage('user');
      this.usersService.getShoppingCartByUserId(user.userId).pipe(
        tap(cart => this.cart = cart)
      ).subscribe((shoppingCarts: ShoppingCart[]) => {
        DBCart = shoppingCarts;

        switch (true) {
          case isAuthenticated && Object.keys(this.cart).length > 0:
            console.log('✅ Usuario autenticado y tiene carrito en (BBDD).');
            return 1;
            case isAuthenticated && Object.keys(localCart).length > 0:
              console.log('⚠️ Usuario autenticado y tiene carrito en el LocalStorage.');
              return 5;
          case isAuthenticated && Object.keys(this.cart).length === 0:
            console.log('⚠️ Usuario autenticado no tiene carrito (BBDD).');
            return 2;
          default:
            console.log('Estado del carrito no identificado.');
            return 0;
        }
      });
    } else {
      switch (true) {
        case !isAuthenticated && Object.keys(localCart).length > 0:
          console.log('⚠️ Usuario no autenticado y tiene carrito en el localStorage.');
          return 3;
        case !isAuthenticated && (!localCart || Object.keys(localCart).length === 0):
          console.log('🚫 Usuario no autenticado y no tiene carrito en el localStorage.');
          this.authService.setLocalStorage('shoppingCart', JSON.stringify({
            "id": "cart1",
            "userId": null
          }));
          return 4;
        default:
          console.log('Estado del carrito no identificado.');
          return 0;
      }
    }
    return 0;
  }
}

