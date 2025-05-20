import React, { useState } from "react";

const Chat = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  const sendMessage = () => {
    if (inputMessage.trim() !== "") {
      setMessages([...messages, inputMessage]);
      setInputMessage("");
    }
  };

  return (
    <div className="chat-container">
      <h2>Chat en temps réel</h2>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <p key={index} className="chat-message">{msg}</p>
        ))}
      </div>
      <input
        type="text"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        placeholder="Écrire un message..."
      />
      <button onClick={sendMessage}>Envoyer</button>
    </div>
  );
};

export default Chat;
