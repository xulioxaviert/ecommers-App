import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { AuthService } from '../../auth/auth.service';
import { DropdownLanguages } from '../../core/models/lang.model';

@Component({
  selector: 'app-translation-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './translation-dropdown.component.html',
  styleUrl: './translation-dropdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TranslationDropdownComponent implements OnInit {
  changeLanguage = output();
  selectedLanguage: any;
  languages: DropdownLanguages[] = [
    { name: 'Español', code: 'es' },
    { name: 'English', code: 'en' },
    { name: 'Français', code: 'fr' },
  ];
  languageForm: FormGroup = new FormGroup({});

  lang = localStorage.getItem('language')
    ? localStorage.getItem('language')
    : 'en';

  constructor(
    private translateService: TranslateService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.translateService.setDefaultLang(this.lang || '');
  }
  ngOnInit(): void {
    this.createForm();
    this.loadData();
  }

  createForm() {
    this.languageForm = this.fb.group({
      language: [ '', [ Validators.required ] ],
    });
    this.chooseLanguage();
  }
  loadData() {
    if (localStorage.getItem('language')) {
      const lang = localStorage.getItem('language');
      this.languages.forEach((data) => {
        if (data.code === lang) {
          this.selectedLanguage = data;
        }
      });
    } else {
      this.selectedLanguage = this.translateService.setDefaultLang('en');
      this.selectedLanguage = this.languages[ 1 ];
      localStorage.setItem('language', 'en');
    }
  }
  //TODO: Revisar con Mario
  chooseLanguage() {
    this.languageForm.get('language')?.valueChanges.subscribe((value) => {
      this.selectedLanguage = value;
      console.log('chooseLanguage / event:', value);
      this.translateService.use(value.code);
      this.translateService.setDefaultLang(value.code);
      localStorage.setItem('language', value.code);
      this.changeLanguage.emit(value.code);
    });
  }
}
