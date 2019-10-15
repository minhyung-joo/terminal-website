import { combineReducers } from "redux";
import {
  ADD_LINE,
  APPEND_TEXT,
  DELETE_ONE,
  PRINT_OUTPUT,
  MOVE_UP_HISTORY,
  MOVE_DOWN_HISTORY
} from "../actions";
import {
  commandMap,
  moveUpHistory,
  moveDownHistory,
  pushToHistory
} from "../terminal";

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
        if (input.length > 0) {
          const { command, params } = parseInput(input);
          if (command.length > 0 && commandMap.hasOwnProperty(command)) {
            newState = commandMap[command](state, params);
          } else {
            newState = Array.from(state);
          }

          pushToHistory(input);
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
    case MOVE_UP_HISTORY:
      const upHistory = moveUpHistory();
      if (upHistory) {
        return state.map((value, index) => {
          if (index === state.length - 1) {
            return "$ " + upHistory;
          }

          return value;
        });
      } else {
        return state;
      }
    case MOVE_DOWN_HISTORY:
      const downHistory = moveDownHistory();
      if (downHistory) {
        return state.map((value, index) => {
          if (index === state.length - 1) {
            return "$ " + downHistory;
          }

          return value;
        });
      } else {
        return state;
      }
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
