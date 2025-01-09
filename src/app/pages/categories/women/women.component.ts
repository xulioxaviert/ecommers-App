import { NgForOf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ENDPOINTS } from '../../../core/const/constants';
import { Products } from '../../../core/models/products.model';
import { HttpService } from '../../../core/services/http.service';

@Component({
  selector: 'app-women',
  standalone: true,
  imports: [ NgForOf, TranslateModule ],
  templateUrl: './women.component.html',
  styleUrl: './women.component.scss',
})
export class WomenComponent implements OnInit {
  products: Products[] = [];

  constructor(private http: HttpService) { }
  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.http.getData(ENDPOINTS.getAllProducts).subscribe((products) => {
      products.body
        .filter((product: Products) => product.category === "women's clothing")
        .forEach((product: Products) => this.products.push(product));
      console.log('products', this.products);
    });
  }
}
