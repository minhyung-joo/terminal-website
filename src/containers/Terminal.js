import React, { useRef, useEffect } from "react";
import "./Terminal.scss";

let terminalWidth = 0;
let fontWidth = 0;
let fontHeight = 0;
let cutoffIndex = 0;
const Terminal = ({ stdin, stdout, pointer }) => {
  const terminalRef = useRef();
  const fontRef = useRef();
  useEffect(() => {
    if (terminalRef.current && fontRef.current) {
      terminalWidth = terminalRef.current.offsetWidth;
      fontWidth = fontRef.current.offsetWidth;
      fontHeight = fontRef.current.offsetHeight;
      cutoffIndex = Math.floor(terminalWidth / fontWidth);
    }
  }, [terminalRef.current, fontRef.current]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  });

  stdout = stdout
    .split("\n")
    .map(line => {
      if (cutoffIndex > 0 && line.length > cutoffIndex) {
        const cuts = line.length / cutoffIndex;
        let newLine = [];
        for (let i = 0; i <= cuts; i++) {
          newLine.push(line.slice(cutoffIndex * i, cutoffIndex * (i + 1)));
        }

        return newLine.join("\n");
      }

      return line;
    })
    .join("\n");

  if (cutoffIndex > 0 && stdin.length > cutoffIndex - 2) {
    const cuts = (stdin.length + 2) / cutoffIndex;
    let newStdin = [];
    for (let i = 0; i <= cuts; i++) {
      if (i === 0) {
        newStdin.push(stdin.slice(0, cutoffIndex * (i + 1) - 2));
      } else {
        newStdin.push(
          stdin.slice(cutoffIndex * i - 2, cutoffIndex * (i + 1) - 2)
        );
      }
    }

    pointer += cuts;
    stdin = newStdin.join("\n");
  }

  return (
    <div className="terminal" ref={terminalRef}>
      <span className="measurement" ref={fontRef}>
        a
      </span>
      <div>
        {stdout}
        <div className="stdin">
          {"$ " + stdin.slice(0, pointer)}
          <span className="cursor">{stdin.charAt(pointer) || " "}</span>
          {stdin.slice(pointer + 1)}
        </div>
      </div>
    </div>
  );
};

export default Terminal;
