/*
 * action types
 */
export const ADD_LINE = "ADD_LINE";
export const APPEND_TEXT = "APPEND_TEXT";
export const DELETE_ONE = "DELETE_ONE";
export const PRINT_OUTPUT = "PRINT_OUTPUT";
export const MOVE_CURSOR_LEFT = "MOVE_CURSOR_LEFT";
export const MOVE_CURSOR_RIGHT = "MOVE_CURSOR_RIGHT";
export const MOVE_UP_HISTORY = "MOVE_UP_HISTORY";
export const MOVE_DOWN_HISTORY = "MOVE_DOWN_HISTORY";
export const AUTOCOMPLETE = "AUTOCOMPLETE";

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

export function printOutput(text) {
  return { type: PRINT_OUTPUT, text };
}

export function moveCursorLeft() {
  return { type: MOVE_CURSOR_LEFT };
}

export function moveCursorRight() {
  return { type: MOVE_CURSOR_RIGHT };
}

export function moveUpHistory() {
  return { type: MOVE_UP_HISTORY };
}

export function moveDownHistory() {
  return { type: MOVE_DOWN_HISTORY };
}

export function autocomplete() {
  return { type: AUTOCOMPLETE };
}
