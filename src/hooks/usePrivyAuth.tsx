import { useEffect, useCallback } from 'react';
import { usePrivy, CrossAppAccountWithMetadata } from '@privy-io/react-auth';
import { useAppDispatch, useAppSelector } from '../store';
import { setWalletAddress, setConnecting, fetchMonadUser, logout } from '../store/authSlice';

export const usePrivyAuth = () => {
  const { authenticated, user, ready, logout: privyLogout, login } = usePrivy();
  const dispatch = useAppDispatch();
  const { walletAddress, isConnecting, user: monadUser, error } = useAppSelector(state => state.auth);

  // Extract wallet address from Monad Games ID cross-app account
  const extractWalletAddress = useCallback(() => {
    if (authenticated && user && ready && user.linkedAccounts.length > 0) {
      // Find the cross-app account for Monad Games ID
      const crossAppAccount = user.linkedAccounts.find(
        account => 
          account.type === 'cross_app' && 
          (account as CrossAppAccountWithMetadata).providerApp?.id === 'cmd8euall0037le0my79qpz42'
      ) as CrossAppAccountWithMetadata;

      if (crossAppAccount && crossAppAccount.embeddedWallets.length > 0) {
        return crossAppAccount.embeddedWallets[0].address;
      }
    }
    return null;
  }, [authenticated, user, ready]);

  // Handle authentication state changes
  useEffect(() => {
    if (!ready) return;

    if (authenticated && user) {
      const address = extractWalletAddress();
      if (address && address !== walletAddress) {
        dispatch(setWalletAddress(address));
        dispatch(fetchMonadUser(address));
      } else if (!address && user.linkedAccounts.length === 0) {
        // User needs to link their Monad Games ID account
        console.log("User needs to link Monad Games ID account");
      }
    } else {
      dispatch(setWalletAddress(null));
    }
  }, [authenticated, user, ready, dispatch, extractWalletAddress, walletAddress]);

  // Login with Monad Games ID
  const loginWithMonadGamesID = useCallback(async () => {
    try {
      dispatch(setConnecting(true));
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      dispatch(setConnecting(false));
    }
  }, [login, dispatch]);

  // Logout
  const handleLogout = useCallback(async () => {
    try {
      await privyLogout();
      dispatch(logout());
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [privyLogout, dispatch]);

  // Check if user needs to register username
  const needsUsernameRegistration = monadUser && !monadUser.hasUsername;

  return {
    isAuthenticated: authenticated && !!walletAddress,
    user: monadUser,
    walletAddress,
    isConnecting,
    isReady: ready,
    error,
    needsUsernameRegistration,
    loginWithMonadGamesID,
    logout: handleLogout,
    registerUsernameUrl: 'https://monad-games-id-site.vercel.app/',
  };
};