import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import type { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import NavBar from "@/components/NavBar";
import "./globals.css";
import { CardanoWallet, MeshProvider } from '@meshsdk/react';
 
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}
 
type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}
 
export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const showNavBar =  (Component as any).showNavBar;
  const showCardanoWallet = (Component as any).showCardanoWallet;
  return (
    <MeshProvider>
      {showNavBar && <NavBar /> }
      {showCardanoWallet && <CardanoWallet/>}
      <Component {...pageProps} />
    </MeshProvider>
  );
}