import React from "react";
import { Card } from "antd";

import { useAsync, useLocalStorageState, fetcher } from "../utils";
import { ErrorBoundary } from "./ErrorBoundary";

const { Meta } = Card;

// Fetches & Renders quotes using name & id(id being used to set quotes in localStorage)
function Quotes({ id, name }) {
  const [quotes, setQuotes] = useLocalStorageState(`character-${id}`);
  const { data, error, run } = useAsync();

  React.useEffect(() => {
    async function geto() {
      if (!quotes) {
        await run(fetcher(name.replace(" ", "+"), false));
      }
    }
    geto();
  }, [run, quotes, name]);

  React.useEffect(() => {
    if (!quotes && data) {
      setQuotes(data);
    }
  }, [data, quotes, setQuotes]);

  return (
    <>
      {(() => {
        if (!quotes) {
          return (
            <Card key="loading" style={{ width: 360, margin: "16px auto" }}>
              <p style={{ margin: 0 }}>Getting quotes...</p>
            </Card>
          );
        } else if (quotes.length > 0) {
          return (
            <>
              <h1 style={{ color: "white", textAlign: "center" }}>Quotes</h1>
              {quotes.map((q, i) => (
                <Card
                  key={q.quote_id}
                  style={{ width: 360, margin: "16px auto" }}
                >
                  <p style={{ margin: 0 }}>{q.quote}</p>
                </Card>
              ))}
            </>
          );
        } else if (error) {
          throw new Error("Woops, Error occured: ", error.message);
        }
      })()}
    </>
  );
}

// Used to render character
const Character = ({ character }) => (
  <Card
    style={{ width: 360, margin: "auto" }}
    cover={<img alt={character.name} src={character.img} />}
  >
    <Meta
      title={character.name}
      description={
        <>
          <p style={{ margin: 0, padding: 0 }}>
            Birthday: {character.birthday}
          </p>
          <div style={{ margin: 0, padding: 0, fontStyle: "italics" }}>
            Occupations:{" "}
            {character.occupation.map((o, i) => (
              <span key={i}>
                {o}
                {character.occupation.length !== i + 1 ? " & " : ""}
              </span>
            ))}
            <p style={{ margin: 0, padding: 0 }}>
              Nickname: {character.nickname}
            </p>
            <p style={{ margin: 0, padding: 0 }}>
              Appearances:{" "}
              {character.appearance
                ? character.appearance.toString()
                : "Unknown"}
            </p>
            <p style={{ margin: 0, padding: 0 }}>
              Character by: {character.portrayed}
            </p>
          </div>
          <p style={{ margin: 0, padding: 0, fontWeight: "bold" }}>
            Status: {character.status}
          </p>
        </>
      }
    />
  </Card>
);

const CharacterPage = ({
  location: {
    state: { character },
  },
}) => {
  return (
    <ErrorBoundary>
      <Character character={character} />
      <Quotes id={character.char_id} name={character.name} />
    </ErrorBoundary>
  );
};

export { CharacterPage };
