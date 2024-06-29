import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AgoraService } from './services/agora.service';
import { FileService } from './services/file.service';
import { RecordingService } from './services/record.service';

@Controller()
export class AppController {
  constructor(
    private readonly agoraService: AgoraService,
    private readonly recordingService: RecordingService,
    private readonly fileService: FileService,
  ) {}

  @Post('generate-token')
  @HttpCode(HttpStatus.OK)
  generateToken(@Body() body: { channelName: string; uid: number }) {
    const token = this.agoraService.generateToken(body.channelName, body.uid);
    console.log(token);
        
    return { token: token};
  }

  @Post('start-recording')
  async startRecording(@Body() body: { channelName: string; uid: number }) {
    const { resourceId, sid } = await this.agoraService.startRecording(
      body.channelName,
      body.uid,
    );
    await this.recordingService.saveRecordingInfo({
      channelName: body.channelName,
      uid: body.uid.toString(),
      resourceId: resourceId,
      sid: sid,
    });
    return { resourceId, sid };
  }

  @Post('stop-recording')
  async stopRecording(
    @Body()
    body: {
      channelName: string;
      uid: string;
      resourceId: string;
      sid: string;
    },
  ) {
    await this.agoraService.stopRecording(
      body.channelName,
      body.uid,
      body.resourceId,
      body.sid,
    );
    await this.recordingService.updateRecordingStatus(body.sid, 'completed');
    return { message: 'Recording stopped successfully' };
  }

  @Get('download-recording/:sid')
  async downloadRecording(@Param('sid') sid: string, @Res() res: Response) {
    const recordingInfo = await this.recordingService.getRecordingInfo(sid);
    const fileStream = await this.agoraService.downloadRecording(recordingInfo);
    res.set({
      'Content-Type': 'audio/mp3',
      'Content-Disposition': `attachment; filename="${sid}.mp3"`,
    });
    fileStream.pipe(res);
  }

  @Post('save-recording')
  async saveRecording(@Body() body: { sid: string }) {
    const recordingInfo = await this.recordingService.getRecordingInfo(
      body.sid,
    );
    const fileStream = await this.agoraService.downloadRecording(recordingInfo);
    const filePath = await this.fileService.saveFile(
      fileStream,
      `${body.sid}.mp3`,
    );
    await this.recordingService.updateRecordingFilePath(body.sid, filePath);
    return { message: 'Recording saved successfully', filePath };
  }
}
