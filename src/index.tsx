import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route, browserHistory } from "react-router";
import ContextProvider from "./components/ContextProvider";
import CatalogHandler from "./components/CatalogHandler";
import Dashboard from "./components/Dashboard";
import Config from "./components/Config";
import Setup from "./components/Setup";

class CirculationWeb {
  constructor(config) {
    let div = document.createElement("div");
    div.id = "opds-catalog";
    document.getElementsByTagName("body")[0].appendChild(div);

    let editorPath = "/admin/web(/collection/:collectionUrl)(/book/:bookUrl)(/tab/:tab)";

    if (config.settingUp) {
      ReactDOM.render(
        <ContextProvider {...config}>
          <Setup />
        </ContextProvider>,
        document.getElementById("opds-catalog")
      );
    } else {
      ReactDOM.render(
        <ContextProvider {...config}>
          <Router history={browserHistory}>
            <Route path={editorPath} component={CatalogHandler} />
            <Route path="/admin/web/dashboard" component={Dashboard} />
            <Route path="/admin/web/config(/:tab)(/:editOrCreate)(/:identifier)" component={Config} />
          </Router>
        </ContextProvider>,
        document.getElementById("opds-catalog")
      );
    }
  }
}

export = CirculationWeb;