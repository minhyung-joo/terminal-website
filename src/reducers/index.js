import { combineReducers } from "redux";
import {
  ADD_LINE,
  APPEND_TEXT,
  DELETE_ONE,
  PRINT_OUTPUT,
  MOVE_UP_HISTORY,
  MOVE_DOWN_HISTORY,
  MOVE_CURSOR_LEFT,
  MOVE_CURSOR_RIGHT
} from "../actions";
import {
  commandMap,
  moveUpHistory,
  moveDownHistory,
  pushToHistory,
  handleChange
} from "../terminal";

const initialState = {
  lines: [],
  pointer: 2
};

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

function terminal(state = initialState, action) {
  const pointer = state.pointer;
  const lines = state.lines;

  switch (action.type) {
    case ADD_LINE:
      let newState = null;
      if (lines.length > 0) {
        const input = lines[lines.length - 1].substring(2);
        if (input.length > 0) {
          const { command, params } = parseInput(input);
          if (command.length > 0 && commandMap.hasOwnProperty(command)) {
            newState = commandMap[command](lines, params);
          }

          pushToHistory(input);
        }
      }

      return Object.assign({}, state, {
        lines: newState ? newState.concat("$ ") : lines.concat("$ "),
        pointer: 2
      });
    case APPEND_TEXT:
      return Object.assign({}, state, {
        lines: state.lines.map((value, index) => {
          if (index === state.lines.length - 1) {
            const changedValue =
              value.slice(0, pointer) + action.text + value.slice(pointer);
            handleChange(changedValue.substring(2));
            return changedValue;
          }

          return value;
        }),
        pointer: state.pointer + 1
      });
    case DELETE_ONE:
      return lines[lines.length - 1].length > 2 && pointer > 2
        ? Object.assign({}, state, {
            lines: state.lines.map((value, index) => {
              if (index === state.lines.length - 1 && value.length >= 3) {
                const changedValue =
                  value.slice(0, pointer - 1) + value.slice(pointer);
                handleChange(changedValue.substring(2));
                return changedValue;
              }

              return value;
            }),
            pointer: state.pointer - 1
          })
        : state;
    case MOVE_CURSOR_LEFT:
      return pointer > 2
        ? Object.assign({}, state, { pointer: pointer - 1 })
        : state;
    case MOVE_CURSOR_RIGHT:
      return pointer < lines[lines.length - 1].length
        ? Object.assign({}, state, { pointer: pointer + 1 })
        : state;
    case MOVE_UP_HISTORY:
      const upHistory = moveUpHistory();
      return Object.assign({}, state, {
        lines: state.lines.map((value, index) => {
          if (index === state.lines.length - 1) {
            return "$ " + upHistory;
          }

          return value;
        }),
        pointer: upHistory.length + 2
      });
    case MOVE_DOWN_HISTORY:
      const downHistory = moveDownHistory();
      return Object.assign({}, state, {
        lines: state.lines.map((value, index) => {
          if (index === state.lines.length - 1) {
            return "$ " + downHistory;
          }

          return value;
        }),
        pointer: downHistory.length + 2
      });
    case PRINT_OUTPUT:
      return Object.assign({}, state, {
        lines: state.lines.concat(action.lines)
      });
    default:
      return state;
  }
}

const terminalApp = combineReducers({
  terminal
});

export default terminalApp;
