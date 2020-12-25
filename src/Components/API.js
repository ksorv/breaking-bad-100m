import * as React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Input, Card, Avatar } from "antd";

const { Search } = Input;
const { Meta } = Card;

const API = "https://www.breakingbadapi.com/api/";

const formatDate = (date) =>
  `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")} ${String(
    date.getSeconds()
  ).padStart(2, "0")}.${String(date.getMilliseconds()).padStart(3, "0")}`;

// the delay argument is for faking things out a bit
async function fetcher(name = "", character = true) {
  let url = API + (character ? `characters?name=` : `quote?author=`) + name;

  return fetch(url, {
    headers: {
      "content-type": "application/json",
      Accept: "application/json"
    }
  }).then(async (response) => {
    try {
      const data = await response.json();
      if (data.length !== 0) return data;
      throw new Error(
        character
          ? `No character with the name "${name}"`
          : `No quotes for author "${name}" found`
      );
    } catch (error) {
      return Promise.reject(new Error(`Error occured: ${error}`));
    }
  });
}

function CharacterCardView({ character }) {
  console.log(
    character.img,
    character.name,
    character.status,
    character.occupation
  );
  return (
    <Card style={{ width: 360, margin: "16px auto" }}>
      <Meta
        avatar={<Avatar size={64} src={character.img} />}
        title={character.name}
        description={
          <>
            <p style={{ margin: 0, padding: 0 }}>{character.birthday}</p>
            <div style={{ margin: 0, padding: 0, fontStyle: "italics" }}>
              {character.occupation.map((o, i) => (
                <span key={i}>
                  {o}
                  {character.occupation.length !== i + 1 ? ", " : ""}
                </span>
              ))}
            </div>
            <p style={{ margin: 0, padding: 0, fontWeight: "bold" }}>
              {character.status}
            </p>
          </>
        }
      />
    </Card>
  );
}

function CharacterForm({ initialcharacterName = "", onSearch }) {
  return (
    <Search
      placeholder="Search Characters by Name"
      allowClear
      enterButton="Search"
      onSearch={onSearch}
      style={{ width: 300, margin: "16px auto", display: "block" }}
    />
  );
}

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      There was an error:{" "}
      <pre style={{ whiteSpace: "normal" }}>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Make Everything Right</button>
    </div>
  );
}

function CharacterErrorBoundary(props) {
  return <ErrorBoundary FallbackComponent={ErrorFallback} {...props} />;
}

export { CharacterForm, CharacterCardView, fetcher, CharacterErrorBoundary };
