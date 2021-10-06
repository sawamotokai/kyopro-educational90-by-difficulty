import Head from "next/head";
import Image from "next/image";
import cheerio from "cheerio";
import got from "got";
import axios from "axios";
import editorialLinks from "../src/editorial-links";
import {
  Select,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  HStack,
  VStack,
  Input,
  Button,
  Heading,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

const getIdFromProbNum = (probNum) => {
  let ret = 0;
  for (let i = 0; i < probNum.length; i++) {
    ret *= 10;
    ret += probNum[i] - "0";
  }
  return ret;
};
export async function getServerSideProps() {
  const problems = [];
  const atCodeBaseURL = "https://atcoder.jp";
  const atCoderURL = `${atCodeBaseURL}/contests/typical90/tasks`;
  const response = await got(atCoderURL);
  const $ = cheerio.load(response.body);
  await $("tr").each((i, el) => {
    if (i === 0) return;
    let [probNum, prob] = $(el).text().trim().replace(/\t/g, "").split("\n");
    const star = prob.slice(prob.indexOf("★") + 1, -1);
    prob = prob.slice(0, prob.indexOf("★") - 1);

    const probURL = `${atCodeBaseURL}${$(el).find("a").attr("href")}`;
    const probId = getIdFromProbNum(probNum);
    const editorialURL = editorialLinks[probId - 1];
    problems.push({ probURL, prob, editorialURL, probNum, star, result: null });
  });
  problems.sort((a, b) => a.star - b.star);
  return {
    props: { problems },
  };
}

function probId2probNum(id) {
  const slug = id.slice(id.indexOf("_") + 1);
  let ret = 0;
  for (let i = 0; i < slug.length; i++) {
    ret *= 26;
    ret += slug.charCodeAt(i) - "a".charCodeAt(0) + 1;
  }
  let str = ret.toString();
  while (str.length < 3) {
    str = "0" + str;
  }
  return str;
}
const colorScheme = "whatsapp";
export default function Home({ problems }) {
  const [probs, setProbs] = useState(problems);
  const [diff, setDiff] = useState("0");
  const [username, setUsername] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [results, setResults] = useState({});

  useEffect(() => {
    if (window.localStorage.getItem("username")) {
      setUsername(window.localStorage.getItem("username"));
      setLoggedIn(true);
    }
  }, []);

  useEffect(async () => {
    if (loggedIn && username !== "") {
      let { data } = await axios.get(
        `https://kenkoooo.com/atcoder/atcoder-api/results?user=${username}`
      );
      data = data.filter((row) => row.contest_id === "typical90");
      let results = {};
      data.forEach((row) => {
        let id = row.problem_id;
        id = probId2probNum(id);
        if (row.result === "AC") {
          results[id] = "AC";
        } else if (id in results) {
          if (results[id] === 'AC') return;
          if (row.result !== "AC") results[id] = "WA";
        } else {
          if (row.result === 'AC') results[id] = 'AC';
          else results[id] = "WA";
        }
      });
      setResults(results);
    } else {
      setResults({});
    }
  }, [loggedIn]);

  function handleDifChange(e) {
    setDiff(e.target.value);
  }

  function handleUsernameChange(e) {
    setUsername(e.target.value);
  }

  function handleLogin() {
    window.localStorage.setItem("username", username);
    setLoggedIn(true);
  }

  function handleLogout() {
    window.localStorage.removeItem("username");
    setUsername("");
    setLoggedIn(false);
  }

  useEffect(() => {
    diff === "0"
      ? setProbs(problems)
      : setProbs(problems.filter((prob) => prob.star === `${diff}`));
  }, [diff]);

  return (
    <VStack p={10}>
      <Head>
        <title>競プロ典型９０問難易度別まとめ</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/icon.png" />
      </Head>

      <main>
        <VStack spacing={10}>
          <Heading> 競プロ典型９０問 難易度別まとめ </Heading>
          {loggedIn ? (
            <Button onClick={handleLogout}>Logout</Button>
          ) : (
            <HStack
              spacing={10}
              alignItems="flex-end"
              justifyContent="space-around"
            >
              <Input
                variant="flushed"
                placeholder="AtCoder username"
                onChange={handleUsernameChange}
                size="xs"
                width="xs"
                colorScheme={colorScheme}
              />
              <Button onClick={handleLogin}>Login</Button>
            </HStack>
          )}
          <Table variant="simple" colorScheme={colorScheme}>
            <Thead>
              <Tr>
                <Th></Th>
                <Th>問題名</Th>
                <Th isNumeric>
                  <Select
                    width="3xs"
                    placeholder="難易度"
                    onChange={handleDifChange}
                  >
                    <option value="2">★2</option>
                    <option value="3">★3</option>
                    <option value="4">★4</option>
                    <option value="5">★5</option>
                    <option value="6">★6</option>
                    <option value="7">★7</option>
                    <option value="0">all</option>
                  </Select>
                </Th>
                <Th isNumeric></Th>
              </Tr>
            </Thead>
            <Tbody>
              {probs.map((prob) => (
                <Tr
                  key={prob.probNum}
                  bg={
                    results[prob.probNum] === "AC"
                      ? "green.100"
                      : results[prob.probNum] === "WA"
                      ? "red.100"
                      : ""
                  }
                >
                  <Td isNumeric>{prob.probNum}</Td>
                  <Td>
                    <a href={prob.probURL} target="_blank" rel="noreferrer">
                      <strong>{prob.prob}</strong>
                    </a>
                  </Td>
                  <Td isNumeric>★{prob.star}</Td>
                  <Td>
                    <a
                      className="arrow-btn"
                      href={prob.editorialURL}
                      target="_blank"
                      rel="noreferrer"
                    >
                      解説 &rarr;
                    </a>
                  </Td>
                </Tr>
              ))}
            </Tbody>
            <Tfoot>
              <Tr>
                <Th></Th>
                <Th>問題名</Th>
                <Th isNumeric>難易度</Th>
                <Th isNumeric></Th>
              </Tr>
            </Tfoot>
          </Table>
        </VStack>
      </main>

      <footer>
        <a
          href="https://twitter.com/techkai_"
          target="_blank"
          rel="noopener noreferrer"
        >
          Follow me on Twitter
        </a>
      </footer>
    </VStack>
  );
}
