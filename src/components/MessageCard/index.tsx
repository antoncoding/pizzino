import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { TwitterTweetEmbed } from "react-twitter-embed";
import {
  Box,
  TransactionBadge,
  LinkBase,
  useTheme,
  IconStar,
  IconStarFilled,
  useToast,
} from "@aragon/ui";

import { EtherscanTxWithParsedMessage } from "../../types";
import { timeSince } from "../../utils/time";
import { Body2 } from "../aragon";
import { Avatar } from "../Avatar";
import { parseTwitterStatusId } from "../../utils/media";
import { getLikedTxs, storeLikedTxs } from "../../utils/storage";
import { VerticalAlignWrapper } from "../Wrapper/VerticalAlignWrapper";

export function MessageCard({
  tx,
  account,
  showMedia,
  compact,
}: {
  tx: EtherscanTxWithParsedMessage;
  account?: string;
  showMedia?: boolean;
  compact?: boolean;
}) {
  const history = useHistory();

  const [liked, setLiked] = useState(false);

  const recipient = useMemo(() => {
    return tx.adapterRecipient || tx.to;
  }, [tx]);

  const adapterName = useMemo(() => tx.adapterName, [tx.adapterName]);

  const toast = useToast();

  const isIncoming = useMemo(
    () => tx.to.toLowerCase() === account?.toLowerCase(),
    [account, tx]
  );
  const theme = useTheme();

  const twitterStatusId = useMemo(() => {
    return parseTwitterStatusId(tx.parsedMessage);
  }, [tx.parsedMessage]);

  useEffect(() => {
    const txs = getLikedTxs();
    const isLiked = txs.map((tx) => tx.hash).includes(tx.hash);
    setLiked(isLiked);
  }, [tx.hash]);

  const clickOnCard = useCallback(() => {
    history.push(`/tx/${tx.hash}`);
  }, [history, tx.hash]);

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

  return tx.parsedMessage.length === 0 ? null : (
    <Box padding={10}>
      <LinkBase onClick={clickOnCard} style={{ width: "100%" }}>
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
            <div style={{ marginTop: "auto", marginBottom: "auto" }}>
              {" "}
              From{" "}
            </div>
            <Avatar
              account={tx.from}
              scale={1}
              size={30}
              showAddress={!compact}
            />
            <div style={{ marginTop: "auto", marginBottom: "auto" }}> to </div>
            <Avatar
              account={recipient}
              scale={1}
              size={30}
              showAddress={!compact}
              isSpecialEntity={!tx.adapterRecipientIsAddress}
              entityLink={tx.adapterRecipientLink}
            />
            {!compact && adapterName && (
              <div style={{ marginTop: "auto", marginBottom: "auto" }}>
                through{" "}
                {
                  <span style={{ color: theme.surfaceContentSecondary }}>
                    {" "}
                    {adapterName}{" "}
                  </span>
                }
              </div>
            )}
            <div style={{ marginTop: "auto", marginBottom: "auto" }}>
              {" "}
              - {timeSince(parseInt(tx.timeStamp))}{" "}
            </div>
          </div>

          {/* buttons, fix at top right corner */}
          <div
            style={{
              // position at top right
              position: "absolute",
              top: 0,
              right: 0,
            }}
          >
            <VerticalAlignWrapper>
              {/* only show Like  or dislike when not in compact mode */}
              {!compact && (
                <LinkBase
                  onClick={clickLike}
                  style={{ display: "inline-block" }}
                >
                  {liked ? <IconStarFilled /> : <IconStar />}
                </LinkBase>
              )}

              {/* Link To etherscan */}
              <LinkBase
                style={{ display: "inline-block" }}
                onClick={() =>
                  (window as any)
                    .open(`https://etherscan.io/tx/${tx.hash}`, "_blank")
                    .focus()
                }
              >
                <TransactionBadge transaction={tx.hash} />
              </LinkBase>
            </VerticalAlignWrapper>
          </div>
        </div>
        <Body2
          style={{
            textAlign: "start",
            width: "100%",
            whiteSpace: "pre-line",
            overflow: "hidden",
          }}
        >
          {tx.parsedMessage}

          {/* show tweet embed */}
          <div>
            {showMedia && twitterStatusId && (
              <TwitterTweetEmbed tweetId={twitterStatusId} />
            )}
          </div>
        </Body2>
      </LinkBase>
    </Box>
  );
}
