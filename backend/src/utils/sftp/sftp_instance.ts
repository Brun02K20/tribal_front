// src/config/sftp.ts
import SftpClient from 'ssh2-sftp-client';

class SftpSingleton {
  private static instance: SftpClient;
  private static connected: boolean = false;

  private static getConfig() {
    return {
      host: process.env.SFTP_HOST,
      port: Number(process.env.SFTP_PORT),
      username: process.env.SFTP_USERNAME,
      password: process.env.SFTP_PASSWORD,
    };
  }

  static async getInstance(): Promise<SftpClient> {
    if (!SftpSingleton.instance) {
      SftpSingleton.instance = new SftpClient();
    }

    if (!SftpSingleton.connected) {
      await SftpSingleton.instance.connect(SftpSingleton.getConfig());
      SftpSingleton.connected = true;

      // Si la conexión se cae, marcamos como desconectado
      SftpSingleton.instance.on('close', () => {
        SftpSingleton.connected = false;
      });
      SftpSingleton.instance.on('end', () => {
        SftpSingleton.connected = false;
      });
    }

    return SftpSingleton.instance;
  }
}

export default SftpSingleton;