import { HttpInterceptorFn } from '@angular/common/http';

export const interceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

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
