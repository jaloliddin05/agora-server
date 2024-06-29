import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Recording } from "src/entities/recording.entity";

@Injectable()
export class RecordingService {
constructor(@InjectRepository(Recording) private recordingRepository: Repository<Recording>) {}

  async saveRecordingInfo(value:{channelName: string, uid: string, resourceId: string, sid: string}): Promise<void> {
    console.log(value);

    const data = this.recordingRepository.create({...value,status: 'recording'})
    
    await this.recordingRepository.save(data);
  }

  async updateRecordingStatus(sid: string, status: string): Promise<void> {
    console.log({
        sid,
        status
    });
    
    await this.recordingRepository.update({ sid }, { status });
  }

  async getRecordingInfo(sid: string){
    console.log(sid);
    
    return this.recordingRepository.findOne({ where: { sid } });
  }

  async updateRecordingFilePath(sid: string, filePath: string): Promise<void> {
    console.log({
        sid,
        filePath
    });
    
    await this.recordingRepository.update({ sid }, { filePath });
  }
}