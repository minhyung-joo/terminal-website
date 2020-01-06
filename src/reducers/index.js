import { combineReducers } from "redux";
import {
  ADD_LINE,
  APPEND_TEXT,
  DELETE_ONE,
  PRINT_OUTPUT,
  MOVE_UP_HISTORY,
  MOVE_DOWN_HISTORY,
  MOVE_CURSOR_LEFT,
  MOVE_CURSOR_RIGHT,
  AUTOCOMPLETE
} from "../actions";
import {
  commandMap,
  moveUpHistory,
  moveDownHistory,
  pushToHistory,
  handleChange,
  autocompleteCommand,
  autocompleteParam
} from "../terminal";

const initialState = {
  stdout: "",
  stdin: "",
  pointer: 0
};

function parseInput(input) {
  if (!input) {
    return { command: "", params: [] };
  }

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
  switch (action.type) {
    case ADD_LINE:
      const input = state.stdin;
      if (input.length > 0) {
        let output = null;
        const { command, params } = parseInput(input);
        if (command === "clear") {
          return {
            ...state,
            stdout: "",
            stdin: "",
            pointer: 0
          };
        } else if (command.length > 0) {
          if (commandMap.hasOwnProperty(command)) {
            output = commandMap[command](params);
          } else {
            output = command + ": command not found";
          }
        }

        pushToHistory(input);
        if (output) {
          return {
            ...state,
            stdout: state.stdout + "$ " + state.stdin + "\n" + output + "\n",
            stdin: "",
            pointer: 0
          };
        }
      }

      return {
        stdin: "",
        stdout: state.stdout.concat("$ ", state.stdin, "\n"),
        pointer: 0
      };
    case APPEND_TEXT:
      const changedValue =
        state.stdin.slice(0, state.pointer) +
        action.text +
        state.stdin.slice(state.pointer);
      handleChange(changedValue);
      return {
        ...state,
        stdin: changedValue,
        pointer: state.pointer + 1
      };
    case DELETE_ONE:
      if (state.stdin.length > 0 && state.pointer > 0) {
        const changedValue =
          state.stdin.slice(0, state.pointer - 1) +
          state.stdin.slice(state.pointer);
        handleChange(changedValue);
        return {
          ...state,
          stdin: changedValue,
          pointer: state.pointer - 1
        };
      }

      return state;
    case MOVE_CURSOR_LEFT:
      return state.pointer > 0
        ? Object.assign({}, state, { pointer: state.pointer - 1 })
        : state;
    case MOVE_CURSOR_RIGHT:
      return state.pointer < state.stdin.length
        ? Object.assign({}, state, { pointer: state.pointer + 1 })
        : state;
    case MOVE_UP_HISTORY:
      const upHistory = moveUpHistory();
      return {
        ...state,
        stdin: upHistory,
        pointer: upHistory.length
      };
    case MOVE_DOWN_HISTORY:
      const downHistory = moveDownHistory();
      return {
        ...state,
        stdin: downHistory,
        pointer: downHistory.length
      };
    case PRINT_OUTPUT:
      return { ...state, stdout: state.stdout.concat(action.text) };
    case AUTOCOMPLETE:
      const { command, params } = parseInput(state.stdin);
      const autocompletedCommand = autocompleteCommand(command);
      if (autocompletedCommand.indexOf("\n") > -1) {
        return {
          ...state,
          stdout: state.stdout.concat(
            "$ ",
            state.stdin,
            "\n",
            autocompletedCommand,
            "\n"
          )
        };
      }

      if (!params || !params.length) {
        return {
          ...state,
          stdin: autocompletedCommand,
          pointer: autocompletedCommand.length
        };
      } else {
        const autocompletedParams = autocompleteParam(command, params);
        if (autocompletedParams) {
          if (autocompletedParams.indexOf("\n") > -1) {
            return {
              ...state,
              stdout: state.stdout.concat(
                "$ ",
                state.stdin,
                "\n",
                autocompletedParams,
                "\n"
              )
            };
          } else {
            const newStdin = mergeStr(state.stdin, autocompletedParams);
            return {
              ...state,
              stdin: newStdin,
              pointer: newStdin.length
            };
          }
        }
      }

      return state;
    default:
      return state;
  }
}

// Joins s1 and s2 by merging common substrings between the end of s1 and start of s2
// mergeStr("asd", "sdf") = "asdf"
function mergeStr(s1, s2) {
  for (let i = 0; i < s2.length; i++) {
    if (
      s1.substring(s1.length - s2.length + i, s1.length) ===
      s2.substring(0, s2.length - i)
    ) {
      return (
        s1.substring(0, s1.length - s2.length + i) + s2.substring(0, s2.length)
      );
    }
  }

  return s1;
}

const terminalApp = combineReducers({
  terminal
});

export default terminalApp;
