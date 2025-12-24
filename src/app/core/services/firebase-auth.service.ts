import { inject, Injectable, EnvironmentInjector, computed, signal, runInInjectionContext } from '@angular/core';
import {
  Auth,
  User,
  authState,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from '@angular/fire/auth';
import { DA_SERVICE_TOKEN } from '@delon/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  private readonly auth = inject(Auth);
  private readonly injector = inject(EnvironmentInjector);
  private readonly tokenService = inject(DA_SERVICE_TOKEN);
  readonly user$: Observable<User | null> = authState(this.auth);
  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  private runInCtx<T>(fn: () => Promise<T>): Promise<T> {
    return runInInjectionContext(this.injector, fn);
  }

  get currentUser(): User | null {
    return this.auth.currentUser;
  }

  async signIn(email: string, password: string): Promise<User> {
    return this.runInCtx(async () => {
      this._loading.set(true);
      try {
        const credential = await signInWithEmailAndPassword(this.auth, email, password);
        const idToken = await credential.user.getIdToken();
        this.tokenService.set({
          token: idToken,
          uid: credential.user.uid,
          email: credential.user.email ?? ''
        });
        return credential.user;
      } finally {
        this._loading.set(false);
      }
    });
  }

  async signUp(email: string, password: string): Promise<User> {
    return this.runInCtx(async () => {
      this._loading.set(true);
      try {
        const credential = await createUserWithEmailAndPassword(this.auth, email, password);
        const idToken = await credential.user.getIdToken();
        this.tokenService.set({
          token: idToken,
          uid: credential.user.uid,
          email: credential.user.email ?? ''
        });
        return credential.user;
      } finally {
        this._loading.set(false);
      }
    });
  }

  async signOut(): Promise<void> {
    return this.runInCtx(async () => {
      await firebaseSignOut(this.auth);
      this.tokenService.clear();
    });
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

  /**
   * Synchronous accessor for template bindings
   */
  readonly isAuthenticated = computed(() => !!this.currentUser);
}
