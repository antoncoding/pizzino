import React, { useCallback, useEffect, useMemo, useState } from "react";
import { EtherscanTx } from "../../types";
import {
  Box,
  TransactionBadge,
  ButtonBase,
  useTheme,
  IconStar,
  IconStarFilled,
  useToast,
} from "@aragon/ui";
import { timeSince } from "../../utils/time";
import { input_to_ascii } from "../../utils/web3";
import { Body2 } from "../aragon";
import { Avatar } from "../Avatar";
import { TwitterTweetEmbed } from "react-twitter-embed";
import { parseTwitterStatusId } from "../../utils/media";
import { getLikedTxs, storeLikedTxs } from "../../utils/storage";

export function MessageCard({
  tx,
  account,
  showMedia,
}: {
  tx: EtherscanTx;
  account?: string;
  showMedia?: boolean;
}) {
  const [liked, setLiked] = useState(false);
  const msg = input_to_ascii(tx.input);

  const toast = useToast();

  const isIncoming = useMemo(
    () => tx.to.toLowerCase() === account?.toLowerCase(),
    [account, tx]
  );
  const theme = useTheme();

  const twitterStatusId = useMemo(() => {
    return parseTwitterStatusId(msg);
  }, [msg]);

  useEffect(() => {
    const txs = getLikedTxs();
    const isLiked = txs.map((tx) => tx.hash).includes(tx.hash);
    setLiked(isLiked);
  }, [tx.hash]);

  const clickLike = useCallback(() => {
    const txs = getLikedTxs();
    const isLiked = txs.map((tx) => tx.hash).includes(tx.hash);
    if (isLiked) {
      // removed from liked array
      const newTxs = txs.filter((savedTx) => savedTx.hash !== tx.hash);
      storeLikedTxs(newTxs);
      setLiked(false);
      toast("Transaction removed from liked");
    } else {
      // add to liked array
      const newTxs = txs.concat([tx]);
      storeLikedTxs(newTxs);
      setLiked(true);
      toast("Transaction added to liked");
    }
  }, [tx, toast]);

  return msg.length === 0 ? null : (
    <Box>
      <div style={{ paddingBottom: "1%", position: "relative" }}>
        <div style={{ display: "flex" }}>
          <div
            style={{
              marginTop: "auto",
              marginBottom: "auto",
              paddingRight: 5,
              color: theme.surfaceContentSecondary,
            }}
          >
            {account && `[  ${isIncoming ? "In" : "Out"} ]`}
          </div>
          <div style={{ marginTop: "auto", marginBottom: "auto" }}> From </div>
          <Avatar account={tx.from} scale={1} size={30} />
          <div style={{ marginTop: "auto", marginBottom: "auto" }}> to </div>
          <Avatar account={tx.to} scale={1} size={30} />
          <div style={{ marginTop: "auto", marginBottom: "auto" }}>
            {" "}
            - {timeSince(parseInt(tx.timeStamp))}{" "}
          </div>
        </div>

        {/* buttons, fix at top right corner */}
        <div
          style={{
            // all child vertical aligned
            display: "flex",
            alignItems: "center",

            // position at top right
            position: "absolute",
            top: 0,
            right: 0,
          }}
        >
          {/* Like  or dislike a tx */}
          <ButtonBase onClick={clickLike} style={{ display: "inline-block" }}>
            {liked ? <IconStarFilled /> : <IconStar />}
          </ButtonBase>

          {/* Link To etherscan */}
          <ButtonBase
            style={{ display: "inline-block" }}
            onClick={() =>
              (window as any)
                .open(`https://etherscan.io/tx/${tx.hash}`, "_blank")
                .focus()
            }
          >
            <TransactionBadge transaction={tx.hash} />
          </ButtonBase>
        </div>
      </div>
      <Body2
        style={{
          whiteSpace: "pre-line",
        }}
      >
        {msg}

        {/* show tweet embed */}
        <div>
          {showMedia && twitterStatusId && (
            <TwitterTweetEmbed tweetId={twitterStatusId} />
          )}
        </div>
      </Body2>
    </Box>
  );
}
