import React, { useRef, useEffect } from "react";
import "./Terminal.scss";

let terminalWidth = 0;
let fontWidth = 0;
let cutoffIndex = 0;
const Terminal = ({ stdin, stdout, pointer }) => {
  const terminalRef = useRef();
  const fontRef = useRef();
  useEffect(() => {
    if (terminalRef.current && fontRef.current) {
      terminalWidth = terminalRef.current.offsetWidth;
      fontWidth = fontRef.current.offsetWidth;
      cutoffIndex = terminalWidth / fontWidth;
    }
  }, [terminalRef.current, fontRef.current]);

  if (cutoffIndex > 0 && stdin.length > cutoffIndex) {
    const cuts = stdin.length / cutoffIndex;
    let newStdin = [];
    for (let i = 0; i <= cuts; i++) {
      newStdin.push(stdin.slice(cutoffIndex * i, cutoffIndex * (i+1)));
    }

    pointer += cuts;
    stdin = newStdin.join("\n");
  }
  
  return (
    <div className="terminal" ref={terminalRef}>
        <span className="measurement" ref={fontRef}>a</span>
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
