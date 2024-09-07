/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from "react";
import io, { type Socket } from "socket.io-client";

const WebSocketComponent: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3000", {
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("WebSocket connection established.");
    });

    newSocket.on("disconnect", () => {
      console.log("WebSocket connection closed.");
    });

    newSocket.on("error", (error: any) => {
      console.error("WebSocket error:", error);
    });

    newSocket.on("chatToClient", (data: any) => {
      setMessages((prev) => [...prev, data.text]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = useCallback(() => {
    if (message.trim() !== "" && socket) {
      socket.emit("chatToServer", {
        uname: "User",
        text: message,
        time: new Date().toISOString(),
      });
      setMessage("");
    }
  }, [socket, message]);

  return (
    <div>
      <h2>WebSocket Chat</h2>
      <div>
        {messages.map((message, index) => (
          <p key={index}>{message}</p>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default WebSocketComponent;
