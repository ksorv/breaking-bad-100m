import * as React from "react";

// to call multiple fns at once
const callAll = (...fns) => (...args) => fns.forEach((fn) => fn?.(args));

const API = "https://www.breakingbadapi.com/api/";

// fetcher is being used to fetch characters and quotes.
async function fetcher(name = "", character = true) {
  let url = API + (character ? `characters?name=` : `quote?author=`) + name;

  return fetch(url, {
    headers: {
      "content-type": "application/json",
      Accept: "application/json",
    },
  }).then(async (response) => {
    try {
      const data = await response.json();
      return data;
    } catch (error) {
      return Promise.reject(new Error(`Error occured: ${error}`));
    }
  });
}

// used so that we dont call dispatch after component has been unmounted
function useSafeDispatch(dispatch) {
  const mounted = React.useRef(false);

  // Using layouteffect and cleanups to set mounted
  React.useLayoutEffect(() => {
    mounted.current = true;
    return () => (mounted.current = false);
  }, []);

  return React.useCallback(
    (...args) => (mounted.current ? dispatch(...args) : void 0),
    [dispatch]
  );
}

// generic reducer for async data fetch and errors
function asyncReducer(state, action) {
  switch (action.type) {
    case "pending": {
      return { status: "pending", data: null, error: null };
    }
    case "resolved": {
      return { status: "resolved", data: action.data, error: null };
    }
    case "rejected": {
      return { status: "rejected", data: null, error: action.error };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

// hook to use fetcher and return data along with memoized fns to call fetcher
function useAsync(initialState = {}) {
  const [state, unsafeDispatch] = React.useReducer(asyncReducer, {
    status: "idle",
    data: null,
    error: null,
    ...initialState,
  });

  const dispatch = useSafeDispatch(unsafeDispatch);

  const { data, error, status } = state;

  const run = React.useCallback(
    (promise) => {
      dispatch({ type: "pending" });
      promise.then(
        (data) => {
          dispatch({ type: "resolved", data });
        },
        (error) => {
          dispatch({ type: "rejected", error });
        }
      );
    },
    [dispatch]
  );

  const setData = React.useCallback(
    (data) => dispatch({ type: "resolved", data }),
    [dispatch]
  );
  const setError = React.useCallback(
    (error) => dispatch({ type: "rejected", error }),
    [dispatch]
  );

  return {
    setData,
    setError,
    error,
    status,
    data,
    run,
  };
}

// hook to use localStorage as state container, with key change support
function useLocalStorageState(
  key,
  defaultValue = "",
  { serialize = JSON.stringify, deserialize = JSON.parse } = {}
) {
  const [state, setState] = React.useState(() => {
    const valueInLocalStorage = window.localStorage.getItem(key);
    if (valueInLocalStorage) {
      return deserialize(valueInLocalStorage);
    }
    return typeof defaultValue === "function" ? defaultValue() : defaultValue;
  });

  const prevKeyRef = React.useRef(key);

  React.useEffect(() => {
    const prevKey = prevKeyRef.current;
    if (prevKey !== key) {
      window.localStorage.removeItem(prevKey);
    }
    prevKeyRef.current = key;
    window.localStorage.setItem(key, serialize(state));
  }, [key, state, serialize]);

  return [state, setState];
}

export { callAll, fetcher, useAsync, useLocalStorageState };
