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

const variables = { HISTSIZE: 500 };

let currentBuffer = "";
let historyPointer = 0;
let historyEdits = {};
const history = [];
export const commandMap = {
  clear: (state, params) => {
    return { ...state, stdout: "" };
  },
  pwd: (state, params) => {
    return { ...state, stdout: state.stdout.concat("$ ", state.stdin, "\n" + (currentPath.length > 0 ? currentPath : "/") + "\n") };
  },
  ls: (state, params) => {
    const dir = getDirectory(currentPath);
    if (Object.keys(dir.structure).length > 0) {
      return { ...state, stdout: state.stdout.concat("$ ", state.stdin, "\n" + Object.keys(dir.structure).join("\t") + "\n") };
    } else {
      return { ...state, stdout: state.stdout.concat("$ ", state.stdin, "\n") };
    }
  },
  uname: (state, params) => {
    return { ...state, stdout: state.stdout.concat("$ ", state.stdin, "\n" + "Minhyung OS" + "\n") };
  },
  cd: (state, params) => {
    if (params.length > 0) {
      const path = params[0];
      let dir = getDirectory(currentPath);
      if (path.includes("/")) {
        if (path.charAt(0) === "/") {
          if (path === "/") {
            currentPath = "";
          } else if (getDirectory(path)) {
            currentPath = path;
          }
        } else {
          const paths = path.split("/");
          for (let i = 0; i < paths.length; i++) {
            const subPath = paths[i];
            if (subPath === "..") {
              if (currentPath.length > 0) {
                const dirs = currentPath.split("/");
                if (dirs.length > 2) {
                  currentPath = dirs.slice(0, dirs.length - 1).join("/");
                } else {
                  currentPath = "";
                }

                dir = getDirectory(currentPath);
              } else {
                return { ...state, stdout: state.stdout.concat("$ ", state.stdin, "\nNo such file or directory\n") };
              }
            } else if (dir.structure.hasOwnProperty(subPath)) {
              currentPath += "/" + subPath;
              dir = getDirectory(currentPath);
            } else {
              return { ...state, stdout: state.stdout.concat("$ ", state.stdin, "\nNo such file or directory\n") };
            }
          }
        }
      } else {
        if (dir.structure.hasOwnProperty(path)) {
          currentPath += "/" + path;
        } else if (path === ".." && currentPath.length > 0) {
          const dirs = currentPath.split("/");
          if (dirs.length > 2) {
            currentPath = dirs.slice(0, dirs.length - 1).join("/");
          } else {
            currentPath = "";
          }
        } else if (path !== ".") {
          return { ...state, stdout: state.stdout.concat("$ ", state.stdin, "\nNo such file or directory\n") };
        }
      }

      return { ...state, stdout: state.stdout.concat("$ ", state.stdin, "\n") };
    } else {
      return { ...state, stdout: state.stdout.concat("$ ", state.stdin, "\n") };
    }
  },
  mkdir: (state, params) => {
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
      return { ...state, stdout: state.stdout.concat("$ ", state.stdin, "\n" + errorMessage + "\n") };
    } else {
      return { ...state, stdout: state.stdout.concat("$ ", state.stdin, "\n") };
    }
  },
  echo: (state, params) => {
    let output = [];
    params.forEach(param => {
      if (param.charAt(0) === "$") {
        const variable = variables[param.substring(1)];
        output.push(variable ? variable : "");
      } else {
        output.push(param);
      }
    });

    return { ...state, stdout: state.stdout.concat("$ ", state.stdin, "\n" + output.join(" ") + "\n") };
  },
  export: (state, params) => {
    params.forEach(param => {
      const paramParts = param.split("=");
      variables[paramParts[0]] = paramParts[1];
    });
    return { ...state, stdout: state.stdout.concat("$ ", state.stdin, "\n") };
  },
  history: (state, params) => {
    let historyOutput = "";
    history.forEach(
      (item, index) =>
        (historyOutput = historyOutput.concat(`\t${index + 1}  ${item}\n`))
    );
    return { ...state, stdout: state.stdout.concat("$ ", state.stdin, "\n" + historyOutput + "\n") };
  },
  touch: (state, params) => {
    const dir = getDirectory(currentPath);
    let errorMessage = null;
    params.forEach(fileName => {
      dir.structure[fileName] = {
        type: "file",
        data: ""
      };
    });

    if (errorMessage) {
      return { ...state, stdout: state.stdout.concat("$ ", state.stdin, "\n" + errorMessage + "\n") };
    } else {
      return { ...state, stdout: state.stdout.concat("$ ", state.stdin, "\n") };
    }
  }
};

function getDirectory(path) {
  if (path === "") {
    return fileSystem;
  }

  if (path.charAt(0) !== "/") {
    return null;
  }

  const dirs = path.split("/").slice(1);
  let pointer = fileSystem;
  dirs.forEach(dir => {
    if (dir.length > 0 && pointer && pointer.structure.hasOwnProperty(dir)) {
      pointer = pointer.structure[dir];
    } else {
      pointer = null;
    }
  });

  return pointer;
}

export const moveUpHistory = () => {
  if (historyPointer > 0) {
    return history[--historyPointer];
  } else {
    return history[historyPointer];
  }
};
export const moveDownHistory = () => {
  if (historyPointer < history.length - 1) {
    return history[++historyPointer];
  } else {
    if (historyPointer < history.length) {
      historyPointer++;
    }

    return currentBuffer;
  }
};
export const pushToHistory = command => {
  if (historyPointer === history.length) {
    history.push(command);
  } else {
    Object.keys(historyEdits).forEach(indexStr => {
      const editedIndex = parseInt(indexStr, 10);
      history[editedIndex] = historyEdits[indexStr];
    });
  }

  currentBuffer = "";
  historyPointer = history.length;
};
export const handleChange = value => {
  if (historyPointer === history.length) {
    currentBuffer = value;
  } else {
    historyEdits[historyPointer] = value;
  }
};
