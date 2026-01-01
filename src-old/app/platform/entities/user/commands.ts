/**
 * User Entity Commands
 * 
 * Command definitions for user entity operations.
 * Commands represent intent to change state.
 */

/**
 * Command to create a new user
 */
export interface CreateUserCommand {
  readonly type: 'CreateUser';
  readonly payload: {
    readonly email: string;
    readonly displayName: string;
    readonly photoURL?: string;
  };
}

/**
 * Command to update user profile
 */
export interface UpdateUserCommand {
  readonly type: 'UpdateUser';
  readonly payload: {
    readonly userId: string;
    readonly updates: Partial<{
      displayName: string;
      email: string;
      photoURL: string;
    }>;
  };
}

/**
 * Command to deactivate a user account
 */
export interface DeactivateUserCommand {
  readonly type: 'DeactivateUser';
  readonly payload: {
    readonly userId: string;
    readonly reason?: string;
  };
}

/**
 * Union type of all user commands
 */
export type UserCommand = CreateUserCommand | UpdateUserCommand | DeactivateUserCommand;
