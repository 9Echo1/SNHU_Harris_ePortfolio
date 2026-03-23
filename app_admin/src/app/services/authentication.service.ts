import { Inject, Injectable } from '@angular/core';
import { BROWSER_STORAGE } from '../storage';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { TripDataService } from '../services/trip-data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  // Setup storage and service access.
  constructor(
    @Inject(BROWSER_STORAGE) private storage: Storage,
    private tripDataService: TripDataService
  ) { }
  // Variable to handle Authentication Responses.
  authResp: AuthResponse = new AuthResponse();

  // Get token from Storage provider.
  // NOTE: For this application we have decided that we will name
  // the key for our token 'travlr-token'
  public getToken(): string {
  return this.storage.getItem('travlr-token') || '';
}

  // Save token to Storage Provider.
  // NOTE: For this application we have decided that we will name
  // the key for our token 'travlr-token'
  public saveToken(token: string): void {
    this.storage.setItem('travlr-token', token);
  }

  // Log out of our application and remove the JWT from Storage
  public logout(): void {
    this.storage.removeItem('travlr-token');
  }

  // Boolean to determine if we are logged in and the token is
  // still valid.  Even if we have a token we will still have to
  // reauthenticate if the token has expired
  public isLoggedIn(): boolean {
    const token: string = this.getToken();
    
    if (!token) {
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp > Date.now() / 1000;
  } catch (error) {
    console.error('Invalid token:', error);
    return false;
  }
}
  // Retrieve the current user.  This function should only be called
  // after the calling method has checked to make sure that the user
  // is logged in.
  public getCurrentUser(): User | null {
  const token: string = this.getToken();

  if (!token) {
    return null;
  }

  try {
    const { email, name } = JSON.parse(atob(token.split('.')[1]));
    return { email, name } as User;
  } catch (error) {
    console.error('Invalid token in getCurrentUser:', error);
    return null;
  }
}
  // Login method that leverages the login method in tripDataService
  // because that method returns an observable, we subscribe to the 
  // result and only process when the Observable condition is satisfied
  // Uncomment the two console.log messages for additional debugging info.
  public login(user: User, passwd: string) : void {
    this.tripDataService.login(user, passwd).subscribe({
      next: (value: any) => {
        if(value)
        {
          console.log(value);
          this.authResp = value;
          this.saveToken(this.authResp.token);
        }
      },
      error: (error: any) => {
        console.log('Error: ' + error);
      },
    });
  }

  // Register method that leverages the register method in
  // tripDataService
  // Because that method returns an observable, we subscribe to the 
  // result and only process wehn the Observable condition is satisfied.
  // Uncomment the two console.log messages for additional debugging
  // info. Please note: This method is nearly identical to the 
  // login method because the behavior of the API logs a new user in
  // immediately upon registration
  public register(user: User, passwd: string) : void {
    this.tripDataService.register(user, passwd).subscribe({
      next: (value: any) => {
        if(value)
        {
          console.log(value);
          this.authResp = value;
          this.saveToken(this.authResp.token);
        }
      },
      error: (error: any) => {
        console.log('Error: ' + error);
      },
    });
  }
}
