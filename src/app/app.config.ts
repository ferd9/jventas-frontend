import { registerLocaleData } from '@angular/common';
import esPE from '@angular/common/locales/es-PE';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { es_ES, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import {
  AppstoreOutline,
  BarChartOutline,
  CheckOutline,
  CloseCircleOutline,
  CloseOutline,
  DeleteOutline,
  DollarOutline,
  DownOutline,
  EllipsisOutline,
  HistoryOutline,
  ImportOutline,
  LoadingOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  PlusOutline,
  SafetyCertificateOutline,
  SearchOutline,
  SettingOutline,
  ShopOutline,
  ShoppingCartOutline,
  SolutionOutline,
  SwapOutline,
  TagsOutline,
  TeamOutline,
  UserOutline,
} from '@ant-design/icons-angular/icons';
import { authInterceptor } from './core/auth/auth.interceptor';

import { routes } from './app.routes';

registerLocaleData(esPE);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideNzI18n(es_ES),
    { provide: LOCALE_ID, useValue: 'es-PE' },
    // registro explícito -- ng-zorro no trae ningún ícono por defecto (se
    // tree-shakea el set completo), hay que declarar cada uno que se usa.
    // Sin esto, <nz-icon> revienta en consola con "icon ... does not exist".
    provideNzIcons([
      AppstoreOutline,
      BarChartOutline,
      CheckOutline,
      CloseCircleOutline,
      CloseOutline,
      DeleteOutline,
      DollarOutline,
      DownOutline,
      EllipsisOutline,
      HistoryOutline,
      ImportOutline,
      LoadingOutline,
      MenuFoldOutline,
      MenuUnfoldOutline,
      PlusOutline,
      SafetyCertificateOutline,
      SearchOutline,
      SettingOutline,
      ShopOutline,
      ShoppingCartOutline,
      SolutionOutline,
      SwapOutline,
      TagsOutline,
      TeamOutline,
      UserOutline,
    ]),
  ],
};
