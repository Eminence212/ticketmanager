let Client = require("ssh2-sftp-client");
const { decriptString } = require("./criptograph");
const { formatDate, compareDate, isToDay } = require("./Format");
module.exports = class ClientSftp {
  constructor(host, port, username, password) {
    this.client = new Client();
    this.host = host;
    this.port = port;
    this.username = username;
    this.password = password;
  }
  async connect() {
    try {
      await this.client.connect({
        host: this.host,
        port: this.port,
        username: this.username,
        password: decriptString(this.password),
      });
      return { state: true, msg: "" };
    } catch (err) {
      return {
        state: false,
        msg: `Échec de la connexion sur ${this.host}:${this.port}:`,
        err,
      };
    }
  }
  async disconnect() {
    await this.client.end();
  }
  async listFiles(remoteDir) {
    let fileObjects;
    try {
      fileObjects = await this.client.list(remoteDir);
    } catch (err) {
      console.log("Listing failed:", err);
    }

    const fileNames = [];
    for (const file of fileObjects) {
      file.type !== "d" && file.type !== "l"
        ? isToDay(file.modifyTime) || isToDay(file.accessTime)
          ? fileNames.push({
              name: file.name,
              type: file.type === "d" ? "directory" : "file",
              modifyTime: formatDate(file.modifyTime),
              accessTime: formatDate(file.accessTime),
            })
          : ""
        : "";
    }
    return fileNames;
  }
  async uploadFile(localFile, remoteFile) {
    try {
      await this.client.put(localFile, remoteFile);
      return { state: true, msg: "" };
    } catch (err) {
      return {
        state: false,
        msg: `L'upload des fichiers de ${localFile} vers ${remoteFile} a échoué: ${err} `,
      };
    }
  }
  async downloadFile(remoteFile, localFile) {
    try {
      await this.client.get(remoteFile, localFile);
      return { state: true, msg: "" };
    } catch (err) {
      return {
        state: true,
        msg: `Le téléchargement des fichiers de ${remoteFile} vers ${localFile} a échoué: ${err} `,
      };
    }
  }
  async deleteFile(remoteFile) {
    try {
      await this.client.delete(remoteFile);
      return { state: true, msg: "" };
    } catch (err) {
      console.error(`La suppression des fichiers de ${remoteFile} a échoué`);
    }
  }
  // async renameFile(from, to) {
  //   try {
  //     await this.client.rename(from, to);
  //     return { state: true, msg: "" };
  //   } catch (err) {
  //     console.error(`${err}`);
  //     return { state: false, msg: err };
  //   }
  // }
};
