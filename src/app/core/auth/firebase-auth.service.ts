import { inject, Injectable, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import {
  Auth,
  User,
  authState,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  getIdToken
} from '@angular/fire/auth';
import { DA_SERVICE_TOKEN } from '@delon/auth';
import { Observable, interval } from 'rxjs';
import { takeWhile, switchMap } from 'rxjs/operators';
import { AuthState } from './auth.state';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  private readonly auth = inject(Auth);
  private readonly injector = inject(EnvironmentInjector);
  private readonly tokenService = inject(DA_SERVICE_TOKEN);
  private readonly state = new AuthState();
  readonly user$: Observable<User | null> = authState(this.auth);
  readonly loading = this.state.loading.asReadonly();
  readonly isAuthenticated = this.state.isAuthenticated;
  readonly currentUserSignal = this.state.currentUser.asReadonly();
  
  // Token refresh interval (45 minutes - tokens expire in 1 hour)
  private readonly TOKEN_REFRESH_INTERVAL_MS = 45 * 60 * 1000;

  constructor() {
    this.user$.subscribe(user => {
      this.state.currentUser.set(user);
      void this.syncTokenFromUser(user);
    });
    
    // Auto-refresh token periodically for active sessions
    this.setupTokenRefresh();
  }
  
  /**
   * Setup automatic token refresh to prevent session expiration
   * IDCTX-P1-001: Session renewal with token refresh
   */
  private setupTokenRefresh(): void {
    interval(this.TOKEN_REFRESH_INTERVAL_MS)
      .pipe(
        takeWhile(() => !!this.auth.currentUser),
        switchMap(() => this.refreshToken())
      )
      .subscribe();
  }
  
  /**
   * Force refresh the current user's ID token
   * IDCTX-P1-003: Session renewal and anti-fixation
   */
  async refreshToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    
    try {
      const freshToken = await getIdToken(user, true); // force refresh
      this.tokenService.set({
        token: freshToken,
        uid: user.uid,
        email: user.email ?? ''
      });
      return freshToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  private runInCtx<T>(fn: () => Promise<T>): Promise<T> {
    return runInInjectionContext(this.injector, fn);
  }

  get currentUser(): User | null {
    return this.auth.currentUser;
  }

  getCurrentUserId(): string | null {
    return this.state.currentUser()?.uid ?? null;
  }

  /**
   * Sign in with email and password
   * IDCTX-P1-001: Email/Password login with session renewal
   * IDCTX-P1-003: Session regeneration after login (anti-fixation)
   */
  async signIn(email: string, password: string): Promise<User> {
    return this.runInCtx(async () => {
      this.state.loading.set(true);
      try {
        const credential = await signInWithEmailAndPassword(this.auth, email, password);
        // Force fresh token on login to prevent session fixation
        const idToken = await credential.user.getIdToken(true);
        this.tokenService.set({
          token: idToken,
          uid: credential.user.uid,
          email: credential.user.email ?? ''
        });
        this.state.currentUser.set(credential.user);
        return credential.user;
      } finally {
        this.state.loading.set(false);
      }
    });
  }
  
  /**
   * Sign in with Google OAuth
   * IDCTX-P1-002: OAuth (Google) login via DA_SERVICE_TOKEN
   */
  async signInWithGoogle(): Promise<User> {
    return this.runInCtx(async () => {
      this.state.loading.set(true);
      try {
        const provider = new GoogleAuthProvider();
        const credential = await signInWithPopup(this.auth, provider);
        const idToken = await credential.user.getIdToken(true);
        this.tokenService.set({
          token: idToken,
          uid: credential.user.uid,
          email: credential.user.email ?? ''
        });
        this.state.currentUser.set(credential.user);
        return credential.user;
      } finally {
        this.state.loading.set(false);
      }
    });
  }
  
  /**
   * Sign in anonymously
   * IDCTX-P1-002: Anonymous login strategy
   */
  async signInAnonymous(): Promise<User> {
    return this.runInCtx(async () => {
      this.state.loading.set(true);
      try {
        const credential = await signInAnonymously(this.auth);
        const idToken = await credential.user.getIdToken(true);
        this.tokenService.set({
          token: idToken,
          uid: credential.user.uid,
          email: credential.user.email ?? ''
        });
        this.state.currentUser.set(credential.user);
        return credential.user;
      } finally {
        this.state.loading.set(false);
      }
    });
  }

  async signUp(email: string, password: string): Promise<User> {
    return this.runInCtx(async () => {
      this.state.loading.set(true);
      try {
        const credential = await createUserWithEmailAndPassword(this.auth, email, password);
        const idToken = await credential.user.getIdToken();
        this.tokenService.set({
          token: idToken,
          uid: credential.user.uid,
          email: credential.user.email ?? ''
        });
        this.state.currentUser.set(credential.user);
        return credential.user;
      } finally {
        this.state.loading.set(false);
      }
    });
  }

  async signOut(): Promise<void> {
    return this.runInCtx(async () => {
      await firebaseSignOut(this.auth);
      this.tokenService.clear();
      this.state.currentUser.set(null);
    });
  }

  async refreshUser(): Promise<User | null> {
    return this.runInCtx(async () => {
      const current = this.auth.currentUser;
      if (!current) return null;
      await current.reload();
      const fresh = this.auth.currentUser;
      this.state.currentUser.set(fresh);
      if (fresh) {
        const idToken = await fresh.getIdToken();
        this.tokenService.set({
          token: idToken,
          uid: fresh.uid,
          email: fresh.email ?? ''
        });
      }
      return fresh ?? null;
    });
  }

  currentEmail(): string | null {
    return this.auth.currentUser?.email ?? null;
  }

  // Backward-compatible aliases
  async signInWithEmailAndPassword(email: string, password: string): Promise<User> {
    return this.signIn(email, password);
  }

  async signUpWithEmailAndPassword(email: string, password: string): Promise<User> {
    return this.signUp(email, password);
  }

  async sendPasswordReset(email: string): Promise<void> {
    return this.runInCtx(() => sendPasswordResetEmail(this.auth, email));
  }

  private async syncTokenFromUser(user: User | null): Promise<void> {
    if (!user) {
      this.tokenService.clear();
      return;
    }

    const idToken = await user.getIdToken();
    this.tokenService.set({
      token: idToken,
      uid: user.uid,
      email: user.email ?? ''
    });
  }
}
