import React from "react";
import { Switch, Route } from "react-router-dom";

import { CharacterComponent } from "./CharacterHome";
import { CharacterPage } from "./Character";

export default function App() {
  return (
    <div className="App">
      <Switch>
        <Route exact path="/" render={() => <CharacterComponent />} />
        <Route
          path="/characters/:id"
          render={(props) => <CharacterPage {...props} />}
        />
      </Switch>
    </div>
  );
}
