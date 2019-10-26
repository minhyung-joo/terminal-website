import React from "react";
import "./Terminal.scss";

const Terminal = ({ lines, pointer }) => {
  const lastLine = lines[lines.length - 1] || "";

  return (
    <div className="terminal">
      {lines.slice(0, lines.length - 1).map(line => (
        <div>{line}</div>
      ))}
      <div>
        {
          <div>
            {lastLine.substring(0, pointer)}
            <span className="cursor">{lastLine.charAt(pointer) || " "}</span>
            {lastLine.substring(pointer + 1)}
          </div>
        }
      </div>
    </div>
  );
};

export default Terminal;
