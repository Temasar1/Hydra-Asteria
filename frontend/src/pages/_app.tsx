import type { ReactElement, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import NavBar from "@/components/NavBar";
import "./globals.css";
import dynamic from 'next/dynamic';
const MeshProvider = dynamic(() => import('@meshsdk/react').then(m => m.MeshProvider), { ssr: false });
const CardanoWallet = dynamic(() => import('@meshsdk/react').then(m => m.CardanoWallet), { ssr: false });
 
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}
 
type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}
 
export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const showNavBar =  (Component as any).showNavBar;
  const showCardanoWallet = (Component as any).showCardanoWallet;
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  return isClient ? (
    <MeshProvider>
      {showNavBar && <NavBar />}
      {showCardanoWallet && <CardanoWallet />}
      <Component {...pageProps} />
    </MeshProvider>
  ) : null;
}