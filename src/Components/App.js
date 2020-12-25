import React from "react";
import {
  fetcher,
  CharacterForm,
  CharacterCardView,
  CharacterErrorBoundary
} from "./API";

import { useAsync } from "../utils";

const callAll = (...fns) => (...args) => fns.forEach((fn) => fn?.(...args));

export default function App() {
  const [search, setSearch] = React.useState("");
  // const [data, setData] = React.useState(null);

  const {data, status, error, run, setData} = useAsync()

  React.useEffect(() => {
    onSearch("");
  });

  // React.useEffect(() => {
  //   window.localStorage.setItem('data', data`)
  // })

  async function onSearch(x) {
    await fetcher(x).then(
      (data) => {
        setData(data);
      },
      (err) => {
        throw new Error("Error occured: ", err.message);
      }
    );
  }

  return (
    <div className="App">
      <CharacterErrorBoundary>
        <CharacterForm
          onSearch={(x) => callAll(setSearch(x), onSearch(x))}
          value={search}
        />
        {data
          ? data.map((d, i) => {
              console.log(d);
              return <CharacterCardView character={d} key={i} />;
            })
          : null}
      </CharacterErrorBoundary>
    </div>
  );
}
