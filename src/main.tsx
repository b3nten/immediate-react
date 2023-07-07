import React, { createElement as h } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  h(React.StrictMode, null, h(App, null)),
);
