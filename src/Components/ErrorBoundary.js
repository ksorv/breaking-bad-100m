import React from "react";

import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      There was an error:{" "}
      <pre style={{ whiteSpace: "normal" }}>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Make Everything Right</button>
    </div>
  );
}

function ErrorBoundaryP(props) {
  return <ErrorBoundary FallbackComponent={ErrorFallback} {...props} />;
}

export { ErrorFallback, ErrorBoundaryP as ErrorBoundary };
