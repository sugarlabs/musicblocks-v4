import * as React from 'react';
import ReactDefault from 'react';

const clientInternals =
  (React as any).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE ||
  (React as any).__CLIENT_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED ||
  (ReactDefault as any)?.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE ||
  {};

const proxyDispatcher = {
  get current() {
    return clientInternals.H?.current ?? clientInternals.H;
  },
  set current(val: any) {
    if (clientInternals.H) {
      clientInternals.H.current = val;
    }
  },
};

const secretInternals = {
  ReactCurrentDispatcher: proxyDispatcher,
  ReactCurrentOwner: {
    get current() {
      return clientInternals.A?.current ?? clientInternals.A;
    },
  },
  ReactCurrentBatchConfig: {
    get transition() {
      return clientInternals.T?.transition ?? null;
    },
  },
};

try {
  Object.defineProperty(React, '__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED', {
    get() {
      return secretInternals;
    },
    configurable: true,
  });
} catch (e) {
  (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = secretInternals;
}

try {
  if (ReactDefault) {
    Object.defineProperty(ReactDefault, '__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED', {
      get() {
        return secretInternals;
      },
      configurable: true,
    });
  }
} catch (e) {
  if (ReactDefault) {
    (ReactDefault as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = secretInternals;
  }
}

if (typeof window !== 'undefined') {
  (window as any).React = React;
}
