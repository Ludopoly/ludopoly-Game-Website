import { useState, useEffect } from 'react';
import { useReduxWallet } from '../features/wallet/context/ReduxWalletProvider';
import type { Account } from '../types/contracts';

export const useAccount = () => {
  const { address, service } = useReduxWallet();
  const [account, setAccount] = useState<Account | null>(null);
  const [hasAccount, setHasAccount] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (address && service) {
      checkUserAccount();
    }
  }, [address, service]);

  const checkUserAccount = async () => {
    if (!address || !service) return;

    setLoading(true);
    setError(null);

    try {
      const accountService = service.getAccountService();
      
      // Kullanıcının blockchain'de hesabı var mı kontrol et
      const userHasAccount = await accountService.hasAccount(address);
      setHasAccount(userHasAccount);

      if (userHasAccount) {
        // Hesap bilgilerini getir
        const userAccount = await accountService.getAccountByAddress(address);
        setAccount(userAccount);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return {
    account,
    hasAccount,
    loading,
    error,
    refetch: checkUserAccount
  };
};
