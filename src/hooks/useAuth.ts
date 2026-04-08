import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import {
  signIn,
  signUp,
  signOut,
  signInWithGoogle,
  getUserProfile,
  subscribeToAuthChanges,
} from '../services/authService';

/**
 * Hook providing authentication actions and state.
 * Sets up an auth state listener on mount.
 */
export const useAuth = () => {
  const {
    firebaseUser,
    userProfile,
    loading,
    error,
    setFirebaseUser,
    setUserProfile,
    setLoading,
    setError,
    clearError,
  } = useAuthStore();

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setFirebaseUser(user);

      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [setFirebaseUser, setUserProfile, setLoading]);

  const handleSignIn = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        clearError();
        await signIn(email, password);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Sign in failed.';
        setError(mapFirebaseError(message));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, clearError, setError],
  );

  const handleSignUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      try {
        setLoading(true);
        clearError();
        const user = await signUp(email, password, displayName);
        // Fetch profile now that the Firestore doc has been created.
        // The onAuthStateChanged listener may have fired before the doc was
        // written, leaving userProfile as null.
        const profile = await getUserProfile(user.uid);
        if (profile) setUserProfile(profile);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Sign up failed.';
        setError(mapFirebaseError(message));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, clearError, setError, setUserProfile],
  );

  const handleGoogleSignIn = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      const user = await signInWithGoogle();
      const profile = await getUserProfile(user.uid);
      if (profile) setUserProfile(profile);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed.';
      setError(mapFirebaseError(message));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError, setUserProfile]);

  const handleSignOut = useCallback(async () => {
    try {
      setLoading(true);
      await signOut();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  return {
    user: firebaseUser,
    userProfile,
    loading,
    error,
    isAuthenticated: !!firebaseUser,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signInWithGoogle: handleGoogleSignIn,
    signOut: handleSignOut,
    clearError,
  };
};

/** Maps Firebase error codes to user-friendly messages. */
const mapFirebaseError = (message: string): string => {
  if (message.includes('user-not-found') || message.includes('wrong-password')) {
    return 'Invalid email or password. Please try again.';
  }
  if (message.includes('email-already-in-use')) {
    return 'An account with this email already exists.';
  }
  if (message.includes('weak-password')) {
    return 'Password should be at least 6 characters.';
  }
  if (message.includes('invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (message.includes('network-request-failed')) {
    return 'Network error. Please check your connection.';
  }
  return message;
};
