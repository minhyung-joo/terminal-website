import React from "react";
import Terminal from "./containers/Terminal";
import { connect } from "react-redux";
import {
  addLine,
  appendText,
  deleteOne,
  printOutput,
  moveUpHistory,
  moveDownHistory,
  moveCursorLeft,
  moveCursorRight
} from "./actions";
import "./index.scss";

class App extends React.Component {
  componentDidMount() {
    const {
      appendText,
      addLine,
      deleteOne,
      printOutput,
      moveUpHistory,
      moveDownHistory,
      moveCursorLeft,
      moveCursorRight
    } = this.props;
    printOutput([
      "Welcome to Minhyung's terminal",
      "Feel free to play around with usual commands",
      "You can learn about me by snooping around",
      "$ "
    ]);

    window.addEventListener("keydown", e => {
      const keyCode = e.keyCode;
      if (keyCode === 8) {
        deleteOne();
      } else if (keyCode === 13) {
        addLine();
      } else if (keyCode === 38) {
        // Up arrow
        moveUpHistory();
      } else if (keyCode === 40) {
        // Down arrow
        moveDownHistory();
      } else if (keyCode === 37) {
        // Left arrow
        moveCursorLeft();
      } else if (keyCode === 39) {
        // Right arrow
        moveCursorRight();
      } else if (
        (keyCode >= 65 && keyCode <= 90) ||
        keyCode === 32 ||
        keyCode === 219 ||
        (keyCode >= 48 && keyCode <= 57) ||
        (keyCode >= 186 && keyCode <= 191) ||
        (keyCode >= 221 && keyCode <= 222)
      ) {
        appendText(e.key);
      }
    });
  }

  render() {
    return (
      <div className="window">
        <Terminal lines={this.props.lines} pointer={this.props.pointer} />
      </div>
    );
  }
}

const mapStateToProps = ({ terminal }) => ({
  lines: terminal.lines,
  pointer: terminal.pointer
});

const mapDispatchToProps = dispatch => ({
  addLine: () => dispatch(addLine()),
  appendText: text => dispatch(appendText(text)),
  deleteOne: () => dispatch(deleteOne()),
  printOutput: lines => dispatch(printOutput(lines)),
  moveUpHistory: () => dispatch(moveUpHistory()),
  moveDownHistory: () => dispatch(moveDownHistory()),
  moveCursorLeft: () => dispatch(moveCursorLeft()),
  moveCursorRight: () => dispatch(moveCursorRight())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
