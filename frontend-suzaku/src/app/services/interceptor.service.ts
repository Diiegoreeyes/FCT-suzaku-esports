import { HttpInterceptorFn } from '@angular/common/http';

export const interceptor: HttpInterceptorFn = (req, next) => {
  let token = '';

  // ⛑️ Comprobamos que estamos en el navegador
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token') || '';
  }

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Token ${token}`
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};
