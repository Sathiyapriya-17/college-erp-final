import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private http = inject(HttpClient);
    private baseUrl = 'http://localhost:8000/api';

    private buildUrl(path: string): string {
        // Don't add trailing slash if path already has a query string
        const hasQuery = path.includes('?');
        return `${this.baseUrl}/${hasQuery ? path : path + '/'}`;
    }

    get<T>(path: string): Observable<T> {
        return this.http.get<T>(this.buildUrl(path)).pipe(
            catchError(this.handleError)
        );
    }

    post<T>(path: string, body: any): Observable<T> {
        return this.http.post<T>(this.buildUrl(path), body).pipe(
            catchError(this.handleError)
        );
    }

    put<T>(path: string, body: any): Observable<T> {
        return this.http.put<T>(this.buildUrl(path), body).pipe(
            catchError(this.handleError)
        );
    }

    patch<T>(path: string, body: any): Observable<T> {
        return this.http.patch<T>(this.buildUrl(path), body).pipe(
            catchError(this.handleError)
        );
    }

    delete<T>(path: string): Observable<T> {
        return this.http.delete<T>(this.buildUrl(path)).pipe(
            catchError(this.handleError)
        );
    }


    private handleError(error: HttpErrorResponse) {
        let errorMessage = 'An unknown error occurred!';
        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
            if (error.error && typeof error.error === 'object') {
                errorMessage += `\nDetails: ${JSON.stringify(error.error)}`;
            }
        }
        console.error(errorMessage);
        return throwError(() => errorMessage);
    }
}
