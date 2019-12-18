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
  pwd: (params) => {
    return currentPath.length > 0 ? currentPath : "/";
  },
  ls: (params) => {
    const dir = getDirectory(currentPath);
    if (Object.keys(dir.structure).length > 0) {
      return Object.keys(dir.structure).join("\t");
    }
  },
  uname: (params) => {
    return "Minhyung OS";
  },
  cd: (params) => {
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
                return "No such file or directory";
              }
            } else if (dir.structure.hasOwnProperty(subPath)) {
              currentPath += "/" + subPath;
            } else {
              return "No such file or directory";
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
          return "No such file or directory";
        }
      }
    }
  },
  mkdir: (params) => {
    const dir = getDirectory(currentPath);
    params.forEach(dirName => {
      if (dirName.includes("/")) {
        return "mkdir: directory name cannot contain /";
      } else {
        dir.structure[dirName] = {
          type: "directory",
          structure: {}
        };
      }
    });
  },
  echo: (params) => {
    let output = [];
    params.forEach(param => {
      if (param.charAt(0) === "$") {
        const variable = variables[param.substring(1)];
        output.push(variable ? variable : "");
      } else {
        output.push(param);
      }
    });

    return output.join(" ");
  },
  export: (params) => {
    params.forEach(param => {
      const paramParts = param.split("=");
      variables[paramParts[0]] = paramParts[1];
    });
  },
  history: (params) => {
    let historyOutput = "";
    history.forEach(
      (item, index) =>
        (historyOutput = historyOutput.concat(`\t${index + 1}  ${item}\n`))
    );
    return historyOutput;
  },
  touch: (params) => {
    const dir = getDirectory(currentPath);
    params.forEach(fileName => {
      dir.structure[fileName] = {
        type: "file",
        data: ""
      };
    });
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
