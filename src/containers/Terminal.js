import React from "react";
import "./Terminal.scss";

const Terminal = ({ stdin, stdout, pointer }) => {
  return (
    <div className="terminal">
        <div>
          {stdout + "$ "}
          {stdin.slice(0, pointer)}
          <span className="cursor">{stdin.charAt(pointer) || " "}</span>
          {stdin.slice(pointer + 1)}
        </div>
    </div>
  );
};

export default Terminal;
