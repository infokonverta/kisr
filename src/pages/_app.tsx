import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Session, SessionContextProvider } from "@supabase/auth-helpers-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import NextNprogress from "nextjs-progressbar";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import "../styles/globals.css";

const queryClient = new QueryClient();

export default function App({
  Component,
  pageProps,
}: AppProps<{
  initialSession: Session;
}>) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());
  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <QueryClientProvider client={queryClient}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
          }}
        />
        <NextNprogress color="#EA6D5C" options={{ showSpinner: false }} />
        <Component {...pageProps} />
      </QueryClientProvider>
    </SessionContextProvider>
  );
}
