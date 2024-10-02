import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import axios from 'axios';
import { useLayoutEffect, useState } from 'react';
import LoadingIndicator from './LoadingIndicator';

declare type PaypalCheckoutButtonProps = {
  paypalUserId?: string;
  bearerToken?: string;
  updateBearerToken: (bearerToken: string) => void;
  onPaymentComplete: (amount: number) => void;
};

const PaypalCheckoutButton = ({
  paypalUserId,
  bearerToken,
  updateBearerToken,
  onPaymentComplete,
}: PaypalCheckoutButtonProps) => {
  const creditPrice = 0.89;
  const [creditsToBuy, setCreditsToBuy] = useState(5);
  const [forceReRender, setForceReRender] = useState(0);
  const [loading, setLoading] = useState(false);

  const incrementCredits = () => {
    if (creditsToBuy < 100) setCreditsToBuy(creditsToBuy + 1);
  };

  const decrementCredits = () => {
    if (creditsToBuy > 5) setCreditsToBuy(creditsToBuy - 1);
  };

  const creditsSpan = (text: string) => (
    <span className="bg-white/10 border border-white/30 text-white text-xs font-medium px-2 py-0.5 rounded">
      {text}
    </span>
  );

  useLayoutEffect(() => {
    const paypalButton = document.querySelector('.paypal-checkout-button');
    if (paypalButton) {
      const timeout = setTimeout(() => {
        if (paypalButton.firstChild === null) {
          setForceReRender(forceReRender + 1);
        }
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, []);

  return (
    <PayPalScriptProvider
      options={{
        components: 'buttons',
        environment: 'sandbox',
        dataUid: paypalUserId,
        dataNamespace: 'paypal_sdk',
        currency: 'EUR',
        clientId:
          'AdgiAh7HycBm1mCIQ2OXo4R-_vf_l0snTCCSneRYhp66T6dpacrn42FclJrQjnFIXYHscBOT_ryPjX9G',
      }}
    >
      <div className="flex flex-col">
        <h2 className="text-sm font-semibold">
          Please select the number of {creditsSpan('Credits')} to purchase
        </h2>
        <p className="my-4 text-sm">
          <b>One</b> {creditsSpan('Credit')} allows you to freeze <b>one</b>{' '}
          file or text. {creditsSpan('Credits')} are non-refundable and
          non-transferable.
        </p>
        <LoadingIndicator className={`${!loading && 'hidden'}`} />
        <div
          className={`flex mt-2 flex-wrap items-center justify-center ${
            loading && 'hidden'
          }`}
        >
          <div className="relative flex items-center max-w-[8rem]">
            <button
              type="button"
              id="decrement-button"
              onClick={decrementCredits}
              className="bg-white/20 hover:bg-white/40 border border-white/50 rounded-s-lg p-3 h-9 focus:outline-none"
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 18 2"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1h16"
                />
              </svg>
            </button>
            <input
              type="text"
              id="quantity-input"
              className="bg-white/20 hover:bg-white/40 border border-white/50 border-x-0 h-9 text-center text-sm focus:ring-blue-500 focus:border-blue-500 block w-full py-2.5"
              value={creditsToBuy}
              disabled
            />
            <button
              type="button"
              id="increment-button"
              onClick={incrementCredits}
              className="bg-white/20 hover:bg-white/40 border border-white/50 rounded-e-lg p-3 h-9 focus:outline-none"
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 18 18"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 1v16M1 9h16"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center ml-2 mr-5">
            <p className="text-sm">
              {creditsSpan('Credits')}
              {` = ${(creditPrice * creditsToBuy).toFixed(2)} EUR`}
            </p>
          </div>

          <PayPalButtons
            forceReRender={[creditsToBuy, forceReRender]}
            createOrder={(_data, actions) => {
              return actions.order.create({
                intent: 'CAPTURE',
                purchase_units: [
                  {
                    amount: {
                      currency_code: 'EUR',
                      value: (creditPrice * creditsToBuy).toFixed(2),
                    },
                    description: `Purchase ${creditsToBuy} credits`,
                  },
                ],
              });
            }}
            onApprove={(data, actions) => {
              return actions!.order!.capture().then((details) => {
                setLoading(true);
                const links = details.links;
                const verificationUrl = links ? links[0].href : '';
                const purchaseUnits = details.purchase_units;
                const euroAmount = purchaseUnits
                  ? purchaseUnits[0].amount?.value || '0'
                  : '0';

                const paypalCheckoutDetails = {
                  payer_id: data.payerID,
                  payment_id: data.paymentID,
                  verification_url: verificationUrl,
                  euro_amount: euroAmount,
                  transaction_date: details.update_time,
                  access_token: data.facilitatorAccessToken,
                };

                axios
                  .post(
                    import.meta.env.VITE_BACKEND_URL + '/api/v1/paypal/buy',
                    paypalCheckoutDetails,
                    {
                      headers: {
                        Authorization: `Bearer ${bearerToken}`,
                      },
                    }
                  )
                  .then((response) => {
                    updateBearerToken(response.data);
                    onPaymentComplete(creditsToBuy);
                  })
                  .catch((error) => {
                    console.error(error);
                  })
                  .finally(() => {
                    setLoading(false);
                  });
              });
            }}
            className="mt-2 text-white rounded-lg paypal-checkout-button"
            style={{
              label: 'pay',
              layout: 'horizontal',
              tagline: false,
              height: 40,
            }}
          />
        </div>
      </div>
    </PayPalScriptProvider>
  );
};

export default PaypalCheckoutButton;
