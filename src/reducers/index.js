import { combineReducers } from "redux";
import { ADD_LINE, APPEND_TEXT, DELETE_ONE, PRINT_OUTPUT } from "../actions";

const commandMap = {
  clear: () => {
    return [];
  },
  pwd: lines => {
    return lines.concat(currentPath.length > 0 ? currentPath : "/");
  },
  ls: lines => {
    const dir = getDirectory(currentPath);
    if (Object.keys(dir.structure).length > 0) {
      return lines.concat(Object.keys(dir.structure).join("\t"));
    } else {
      return Array.from(lines);
    }
  },
  uname: lines => {
    return lines.concat("Minhyung OS");
  },
  cd: (lines, params) => {
    if (params.length > 0) {
      const path = params[0];
      const dir = getDirectory(currentPath);
      if (dir.structure.hasOwnProperty(path)) {
        currentPath += "/" + path;
        return Array.from(lines);
      } else if (path.substring(0, 2) === ".." && currentPath.length > 0) {
        const dirs = currentPath.split("/");
        if (dirs.length > 2) {
          currentPath = dirs.slice(0, dirs.length - 1).join("/");
        } else {
          currentPath = "";
        }
        return Array.from(lines);
      } else {
        return lines.concat("No such file or directory");
      }
    } else {
      return Array.from(lines);
    }
  },
  mkdir: (lines, params) => {
    const dir = getDirectory(currentPath);
    let errorMessage = null;
    params.forEach(dirName => {
      if (dirName.includes("/")) {
        errorMessage = "mkdir: directory name cannot contain /";
      } else {
        dir.structure[dirName] = {
          type: "directory",
          structure: {}
        };
      }
    });

    if (errorMessage) {
      return lines.concat(errorMessage);
    } else {
      return Array.from(lines);
    }
  },
  echo: (lines, params) => {
    let output = [];
    params.forEach(param => {
      const match = param.match(/"(?:[^"\\]|\\.)*"/);
      if (match && param.length > 2) {
        output.push(param.substring(1, param.length - 1));
      } else {
        output.push(param);
      }
    });

    return lines.concat(output.join(" "));
  }
};

let currentPath = "";

const fileSystem = {
  type: "directory",
  structure: {
    bin: {
      type: "directory",
      structure: {}
    },
    home: {
      type: "directory",
      structure: {
        mjoo: {
          type: "directory",
          structure: {}
        }
      }
    },
    var: {
      type: "directory",
      structure: {}
    }
  }
};

function getDirectory(path) {
  const dirs = path.split("/");
  let pointer = fileSystem;
  dirs.forEach(dir => {
    if (dir.length > 0 && pointer.structure.hasOwnProperty(dir)) {
      pointer = pointer.structure[dir];
    }
  });

  return pointer;
}

function parseInput(input) {
  let inputStr = input.trim();
  const firstSpaceIndex = inputStr.indexOf(" ");
  if (firstSpaceIndex > 0) {
    const command = inputStr.slice(0, firstSpaceIndex);
    const args = inputStr.slice(firstSpaceIndex + 1);
    const params = [];
    let buffer = "";
    let quoteMode = false;
    let quoteCharacter = "";
    for (let i = 0; i < args.length; i++) {
      const c = args.charAt(i);
      if (c === " " && buffer.length > 0 && !quoteMode) {
        params.push(buffer);
        buffer = "";
      } else if (!quoteMode && (c === '"' || c === "'")) {
        quoteMode = true;
        quoteCharacter = c;
      } else if (!quoteMode && c !== " ") {
        buffer += c;
      } else if (quoteMode && c !== quoteCharacter) {
        buffer += c;
      } else if (quoteMode && c === quoteCharacter) {
        quoteCharacter = "";
        quoteMode = false;
        params.push(buffer);
        buffer = "";
      }
    }
    if (buffer.length > 0) {
      params.push(buffer);
    }

    console.log(params);

    return { command, params };
  } else {
    return { command: inputStr, params: [] };
  }
}

function lines(state = [], action) {
  switch (action.type) {
    case ADD_LINE:
      let newState = null;
      if (state.length > 0) {
        const input = state[state.length - 1].substring(2);
        const { command, params } = parseInput(input);
        if (command.length > 0 && commandMap.hasOwnProperty(command)) {
          newState = commandMap[command](state, params);
        } else {
          newState = Array.from(state);
        }
      } else {
        newState = Array.from(state);
      }

      newState.push("$ ");
      return newState;
    case APPEND_TEXT:
      return state.map((value, index) => {
        if (index === state.length - 1) {
          return value + action.text;
        }

        return value;
      });
    case DELETE_ONE:
      return state.map((value, index) => {
        if (index === state.length - 1 && value.length >= 3) {
          return value.substring(0, value.length - 1);
        }

        return value;
      });
    case PRINT_OUTPUT:
      return state.concat(action.lines);
    default:
      return state;
  }
}

const terminalApp = combineReducers({
  lines
});

export default terminalApp;
