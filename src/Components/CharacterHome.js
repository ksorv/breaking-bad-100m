import * as React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Input, Card, Avatar, Select, Tag, List } from "antd";
import { Link } from "react-router-dom";

import { useAsync, useLocalStorageState, fetcher } from "../utils";

const { Meta } = Card;

const cardsPerPage = 10;

function CharacterCardView({ character }) {
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

function CharacterForm({
  initialcharacterName = "",
  onChange,
  value,
  select,
  setSelect,
}) {
  const options = [{ value: "Breaking Bad" }, { value: "Better Call Saul" }];
  const color = { "Breaking Bad": "green", "Better Call Saul": "cyan" };

  function tagRender(props) {
    const { label, value, closable, onClose } = props;

    return (
      <Tag
        color={color[value]}
        closable={closable}
        onClose={onClose}
        style={{ marginRight: 3 }}
      >
        {label}
      </Tag>
    );
  }

  function handleChange(e) {
    setSelect(e);
  }

  return (
    <>
      <Input
        placeholder="Search Characters by Name"
        value={value}
        autoFocus
        allowClear
        onChange={onChange}
        style={{ margin: "16px auto" }}
      />
      <Select
        mode="multiple"
        showArrow
        value={select}
        onChange={handleChange}
        tagRender={tagRender}
        style={{ width: "100%" }}
        options={options}
      />
      ,
    </>
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

function CharacterComponent() {
  const [search, setSearch] = React.useState("");
  const [select, setSelect] = React.useState([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [characters, setCharacters] = useLocalStorageState("characters");
  const [pageNumber, setPageNumber] = React.useState(0);

  const { data, status, error, run } = useAsync();

  const filteredCharacters = React.useRef(characters);

  React.useEffect(() => {
    async function geto() {
      if (!characters) {
        await run(fetcher(""));
      }
    }
    geto();
  }, [run, characters]);

  React.useEffect(() => {
    if (!characters && data) {
      setCharacters(data);
    }
  }, [data, characters, setCharacters]);

  React.useEffect(() => {
    if (characters) {
      filteredCharacters.current = characters
        .filter((character) => {
          return character.name.toLowerCase().includes(search.toLowerCase());
        })
        .filter((character) => {
          switch (select.length) {
            case 1:
              return character.category.includes(select[0]);
            case 2:
              return (
                character.category.includes(select[0]) &&
                character.category.includes(select[1])
              );
            default:
              return true;
          }
        });
      setPageNumber(
        Math.ceil(filteredCharacters.current.length / cardsPerPage)
      );
    }

    if (currentPage > pageNumber) setCurrentPage(1);
  }, [characters, select, search, currentPage, pageNumber]);

  const pageRenderStyle = (item) =>
    item === currentPage
      ? { backgroundColor: "grey" }
      : { backgroundColor: "white" };

  const RenderPageNumbers = () => (
    <List
      grid={{
        gutter: 2,
        xs: 7,
        sm: 7,
        md: 7,
        lg: 7,
        xl: 7,
        xxl: 7,
      }}
      dataSource={Array(pageNumber)
        .fill()
        .map((_, i) => i + 1)}
      renderItem={(item) => (
        <List.Item
          key={item}
          id={item}
          onClick={(e) => setCurrentPage(parseInt(e.target.innerHTML))}
        >
          <Card style={pageRenderStyle(item)}>{item}</Card>
        </List.Item>
      )}
    />
  );

  if (filteredCharacters.current) {
    // Logic for displaying current cards
    const indexOfLastCard = currentPage * cardsPerPage;
    const indexOfFirstCard = indexOfLastCard - cardsPerPage;
    const currentCards = filteredCharacters.current.slice(
      indexOfFirstCard,
      indexOfLastCard
    );

    function CharacterList() {
      return (
        <CharacterErrorBoundary>
          <CharacterForm
            onChange={(x) => setSearch(x.target.value)}
            value={search}
            select={select}
            setSelect={setSelect}
          />
          {currentCards.map((d, i) => (
            <Link
              to={{
                pathname: `/characters/${d.char_id}`,
                state: { character: d },
              }}
              key={i}
            >
              <CharacterCardView character={d} />
            </Link>
          ))}
        </CharacterErrorBoundary>
      );
    }

    return (
      <>
        {(() => {
          if (!characters) {
            switch (status) {
              case "idle":
                return <p className="state">Starting app...</p>;
              case "pending":
                return <p className="state">Loading data...</p>;
              case "resolved":
                return <CharacterList />;
              case "rejected":
                throw new Error(
                  "Something bad happened while getting data, Here is some help:",
                  error
                );

              default:
                throw new Error("Woaah, That was not supposed to happen.");
            }
          } else {
            return <CharacterList />;
          }
        })()}
        <RenderPageNumbers />
      </>
    );
  } else {
    return (
      <Card key="loading" style={{ width: 360, margin: "16px auto" }}>
        <p style={{ margin: 0 }}>Getting characters...</p>
      </Card>
    );
  }
}

export {
  CharacterForm,
  CharacterCardView,
  fetcher,
  CharacterErrorBoundary,
  CharacterComponent,
};
