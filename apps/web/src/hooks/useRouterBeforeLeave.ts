import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

export function useRouterBeforeLeave(callback: () => void) {
  const router = useRouter();
  const prevUrl = useRef(router.asPath);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (prevUrl.current !== url) {
        callback();
      }
      prevUrl.current = url;
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router, callback]);
}
