import Head from "next/head";
import Image from "next/image";
import cheerio from "cheerio";
import got from "got";
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
    const elem = $(el).text();
    console.log(typeof elem);
    console.log(elem);
    let [probNum, prob] = elem.trim().replaceAll("\t", "").split("\n");
    const star = prob.slice(prob.indexOf("★") + 1, -1);
    prob = prob.slice(0, prob.indexOf("★") - 1);

    const probURL = `${atCodeBaseURL}${$(el).find("a").attr("href")}`;
    const probId = getIdFromProbNum(probNum);
    if (isNaN(probId)) return;
    const editorialURL = editorialLinks[probId - 1];
    problems.push({ probURL, prob, editorialURL, probNum, star });
  });
  problems.sort((a, b) => a.star - b.star);
  return {
    props: { problems },
  };
}

export default function Home({ problems }) {
  const [probs, setProbs] = useState(problems);
  const [diff, setDiff] = useState("0");

  function handleDifChange(e) {
    setDiff(e.target.value);
  }

  useEffect(() => {
    diff === "0"
      ? setProbs(problems)
      : setProbs(problems.filter((prob) => prob.star === `${diff}`));
  }, [diff]);

  return (
    <div className="container">
      <Head>
        <title>競プロ典型９０問難易度別まとめ</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/icon.png" />
      </Head>

      <main>
        <h1>競プロ典型９０問難易度別まとめ</h1>
        <Table variant="simple" colorScheme="whatsapp">
          <Thead>
            <Tr>
              <Th></Th>
              <Th>問題名</Th>
              <Th isNumeric>
                <Select placeholder="難易度★" onChange={handleDifChange}>
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
              <Tr key={prob.prob}>
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
    </div>
  );
}
