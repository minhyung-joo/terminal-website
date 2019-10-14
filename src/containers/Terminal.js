import React from "react";
import "./Terminal.scss";

const Terminal = ({ lines }) => {
  const text = lines.reduce((accumulator, line, index) => {
    if (index === lines.length - 1) {
      return accumulator + line;
    } else {
      return accumulator + line + "\n";
    }
  }, "");

  return (
    <div className="terminal">
      {text}
      <span className="cursor"> </span>
    </div>
  );
};

export default Terminal;
