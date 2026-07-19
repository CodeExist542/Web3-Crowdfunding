// src/hooks/useWallet.ts
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { ethers } from "ethers";

const useWallet = () => {
  const [wallet, setWallet] = useState<string | null>(null);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) setWallet(accounts[0]);
        });
    }
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWallet(accounts[0]);
    } else {
      toast.error("Metamask belum terinstal!");
    }
  };

  return { wallet, connectWallet };
};

export default useWallet;
