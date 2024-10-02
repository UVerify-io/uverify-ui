import { useLayoutEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import LoadingIndicator from './LoadingIndicator';

const PaypalConnectButton = () => {
  const paypalContainer = useRef<HTMLDivElement>(null);
  const [paypalScriptLoading, setPaypalScriptLoading] = useState(true);

  useLayoutEffect(() => {
    const initPaypalConnectButton = () => {
      const globalWindow = window as any;
      if (typeof globalWindow.paypal?.use === 'function') {
        globalWindow.paypal.use(['login'], function (login: any) {
          if (typeof login?.render === 'function') {
            setPaypalScriptLoading(false);
            login.render({
              appid:
                'AdgiAh7HycBm1mCIQ2OXo4R-_vf_l0snTCCSneRYhp66T6dpacrn42FclJrQjnFIXYHscBOT_ryPjX9G',
              authend: 'sandbox',
              scopes: 'openId https://uri.paypal.com/services/paypalattributes',
              containerid: 'paypalConnectButton',
              responseType: 'code',
              locale: 'de-de',
              buttonType: 'CWP',
              buttonShape: 'rectangle',
              buttonSize: 'sm',
              fullPage: 'false',
              returnurl: 'https://uverify.io/create',
            });
          } else {
            toast.warn('Login with PayPal currently not available');
          }
        });
      } else {
        toast.warn(
          'Login with PayPal currently not available. Try to refresh the page.'
        );
      }
    };

    if (
      paypalContainer.current &&
      paypalContainer.current.firstChild === null
    ) {
      const paypalSpan = document.createElement('span');
      paypalSpan.id = 'paypalConnectButton';
      paypalContainer.current.appendChild(paypalSpan);
      const script = document.createElement('script');
      const body = document.getElementsByTagName('body')[0];
      script.id = 'paypal-api-script';
      script.async = true;

      const timeout = setTimeout(() => {
        script.src = 'https://www.paypalobjects.com/js/external/api.js';
      }, 500);
      body.appendChild(script);

      script.addEventListener('load', initPaypalConnectButton);

      return () => {
        clearTimeout(timeout);
        script.removeEventListener('load', initPaypalConnectButton);
        body.removeChild(script);

        if (paypalContainer.current !== null) {
          paypalContainer.current.removeChild(
            paypalContainer.current.firstChild as Node
          );
        }

        if ((window as any).paypal) {
          (window as any).paypal = undefined;
          delete (window as any).paypal;
        }
      };
    }
  }, []);

  return (
    <>
      {paypalScriptLoading && <LoadingIndicator className="min-h-[49px]" />}
      <div className="min-w-[236px]" ref={paypalContainer}></div>
    </>
  );
};

export default PaypalConnectButton;
