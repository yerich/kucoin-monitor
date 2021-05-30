const {spawn} = require("child_process");

const spawnSync = (cmd, options = [], {stdin} = {}) => {
  return new Promise((resolve, reject) => {
    console.log(cmd + " " + options.join(" "));
    let stdout = "";
    const child = spawn(cmd, options);

    if (stdin) {
      child.stdin.write(stdin);
      child.stdin.end();
    }

    child.stdout.on("data", data => {
      stdout += data.toString();
      // console.log(data.toString());
    });

    child.stderr.on("data", data => {
      console.error(data.toString());
    });

    child.on('error', (error) => {
      console.log(`${cmd} error: ${error.message}`);
      reject(error);
    });

    child.on("close", code => {
      console.log(`${cmd} exit: ${code}`);
      resolve({stdout, code});
    });
  });
}

module.exports = {
  spawnSync
}