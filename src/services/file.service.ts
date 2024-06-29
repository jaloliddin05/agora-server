import { Injectable } from "@nestjs/common";
import path from "path";
import fs from 'fs'
import { Readable } from "typeorm/platform/PlatformTools";

@Injectable()
export class FileService {
  async saveFile(fileStream: Readable, fileName: string): Promise<string> {
    const filePath = path.join(process.cwd(), 'uploads/call', fileName);
    await new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(filePath);
      fileStream.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    return filePath;
  }
}