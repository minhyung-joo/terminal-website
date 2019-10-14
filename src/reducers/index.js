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

/*
function generateParentPointers(parent) {
  Object.keys(parent.structure).forEach(dir => {
    let child = parent.structure[dir];
    child.parent = parent;
    generateParentPointers(child);
  });
}

generateParentPointers(fileSystem);
*/

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

function lines(state = [], action) {
  switch (action.type) {
    case ADD_LINE:
      let newState = null;
      if (state.length > 0) {
        const input = state[state.length - 1].substring(2);
        const inputParts = input.split(" ");
        const command = inputParts[0];
        const params = inputParts.splice(1);
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
