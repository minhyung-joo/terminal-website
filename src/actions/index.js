/*
 * action types
 */
export const ADD_LINE = "ADD_LINE";
export const APPEND_TEXT = "APPEND_TEXT";
export const DELETE_ONE = "DELETE_ONE";
export const PRINT_OUTPUT = "PRINT_OUTPUT";
export const MOVE_UP_HISTORY = "MOVE_UP_HISTORY";
export const MOVE_DOWN_HISTORY = "MOVE_DOWN_HISTORY";

/*
 * action creators
 */
export function addLine() {
  return { type: ADD_LINE };
}

export function appendText(text) {
  return { type: APPEND_TEXT, text };
}

export function deleteOne() {
  return { type: DELETE_ONE };
}

export function printOutput(lines) {
  return { type: PRINT_OUTPUT, lines };
}

export function moveUpHistory() {
  return { type: MOVE_UP_HISTORY };
}

export function moveDownHistory() {
  return { type: MOVE_DOWN_HISTORY };
}
