import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { LiquidSDK } from "liquid-sdk";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEPLOY_BLOCK = BigInt(43327823);
const CHUNK_SIZE = BigInt(10000);
const CONCURRENCY = 5;

async function main() {
  console.log("Scanning all Liquid Protocol tokens...");

  const publicClient = createPublicClient({
    chain: base,
    transport: http("https://mainnet.base.org"),
  });
  const sdk = new LiquidSDK({ publicClient });
  const currentBlock = await publicClient.getBlockNumber();

  console.log(`Deploy block: ${DEPLOY_BLOCK}`);
  console.log(`Current block: ${currentBlock}`);
  console.log(`Blocks to scan: ${currentBlock - DEPLOY_BLOCK}`);

  const chunks = [];
  let fromBlock = DEPLOY_BLOCK;
  while (fromBlock < currentBlock) {
    const toBlock =
      fromBlock + CHUNK_SIZE > currentBlock
        ? currentBlock
        : fromBlock + CHUNK_SIZE;
    chunks.push({ from: fromBlock, to: toBlock });
    fromBlock = toBlock + BigInt(1);
  }

  console.log(`Chunks: ${chunks.length} (size ${CHUNK_SIZE})`);

  const allTokens = [];
  let scanned = 0;

  for (let i = 0; i < chunks.length; i += CONCURRENCY) {
    const batch = chunks.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map((chunk) =>
        sdk
          .getTokens({ fromBlock: chunk.from, toBlock: chunk.to })
          .then((tokens) =>
            tokens.map((t) => ({
              address: t.tokenAddress,
              name: t.tokenName,
              symbol: t.tokenSymbol,
              image: t.tokenImage,
              poolId: t.poolId,
              hook: t.poolHook,
              creator: t.msgSender,
              blockNumber: Number(t.blockNumber ?? 0),
            }))
          )
      )
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        allTokens.push(...result.value);
      }
    }

    scanned += batch.length;
    if (scanned % 50 === 0 || scanned === chunks.length) {
      console.log(
        `Progress: ${scanned}/${chunks.length} chunks, ${allTokens.length} tokens found`
      );
    }
  }

  // Sort by block number (newest first)
  allTokens.sort((a, b) => b.blockNumber - a.blockNumber);

  const outputPath = join(__dirname, "..", "lib", "tokens-data.json");
  writeFileSync(
    outputPath,
    JSON.stringify(
      { tokens: allTokens, scannedAtBlock: Number(currentBlock) },
      null,
      2
    )
  );

  console.log(`\nDone! ${allTokens.length} tokens saved to ${outputPath}`);
  console.log(`Scanned up to block ${currentBlock}`);
}

main().catch(console.error);
