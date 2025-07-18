import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isAuthRoute = req.url.includes('/login') || req.url.includes('/register');
  const token = localStorage.getItem('access_token');

  if (!isAuthRoute && token) {
    
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }

  return next(req);
};