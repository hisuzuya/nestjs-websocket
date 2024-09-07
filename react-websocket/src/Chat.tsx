import React, { useState, useEffect, useCallback } from "react";

import io from "socket.io-client";

type Chat = {
  socketId: string;
  uname: string;
  time: string;
  text: string;
};
type ChatLog = Array<Chat>;

//接続
const socket = io("http://localhost:3000");
export const Chat: React.FC = () => {
  const [chatLog, setChatLog] = useState<ChatLog>([]);
  const [uname, setUname] = useState<string>("");
  const [text, setText] = useState<string>("");

  useEffect(() => {
    //接続が完了したら、発火
    socket.on("connect", () => {
      console.log("接続ID : ", socket.id);
    });

    //切断
    return () => {
      console.log("切断");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    //サーバーからのチャット情報のプッシュを感知→反映
    socket.on("chatToClient", (chat: Chat) => {
      console.log("chat受信", chat);
      const newChatLog = [...chatLog];
      newChatLog.push(chat);
      setChatLog(newChatLog);
    });
  }, [chatLog]);

  //現在時刻取得
  const getNow = useCallback((): string => {
    const datetime = new Date();
    return `${datetime.getFullYear()}/${
      datetime.getMonth() + 1
    }/${datetime.getDate()} ${datetime.getHours()}:${datetime.getMinutes()}:${datetime.getSeconds()}`;
  }, []);

  //チャット送信
  const sendChat = useCallback((): void => {
    if (!uname) {
      alert("ユーザー名を入れてください。");
      return;
    }
    console.log("送信");
    socket.emit("chatToServer", { uname: uname, text: text, time: getNow() });
    setText("");
  }, [uname, text, getNow]);

  return (
    <>
      <div>
        <div>ユーザー名</div>
        <div>
          <input
            type="text"
            value={uname}
            onChange={(event) => {
              setUname(event.target.value);
            }}
          />
        </div>
        <br />
        <section
          style={{
            backgroundColor: "rgba(30,130,80,0.3)",
            height: "50vh",
            overflow: "scroll",
          }}
        >
          <h2>チャット</h2>
          <hr />
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {chatLog.map((chat, index) => {
              return (
                <li
                  key={index}
                  style={{
                    margin:
                      uname === chat.uname ? "0 15px 0 auto " : "0 auto 0 15px",
                  }}
                >
                  <div>
                    <small>
                      {chat.time} [{chat.socketId}]
                    </small>
                  </div>
                  <div>
                    【{chat.uname}】 : {chat.text}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
        <br />
        <div>送信内容</div>
        <div>
          <input
            type="text"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
            }}
          />
        </div>
        <br />
        <div>
          <button onClick={sendChat}> send </button>
        </div>
        <br />
        <div></div>
      </div>
    </>
  );
};
