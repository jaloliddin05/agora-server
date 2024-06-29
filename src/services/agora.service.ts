import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import axios from 'axios';
import { Readable } from 'stream';

@Injectable()
export class AgoraService {
  private agoraConfig
  constructor(
    private readonly configService: ConfigService
  ){
    this.agoraConfig = this.configService.get('agora')
  }
  private logger = new Logger(AgoraService.name);

  generateToken(channelName: string, uid: number): string {
    
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;  

    console.log(
      this.agoraConfig.appId,
      this.agoraConfig.appCertificate,
      channelName,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpiredTs);

    return RtcTokenBuilder.buildTokenWithUid(
      this.agoraConfig.appId,
      this.agoraConfig.appCertificate,
      channelName,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpiredTs
    );
  }

  async startRecording(channelName: string, uid: number): Promise<{ resourceId: string; sid: string }> {
    try {
      // Acquire the recording resource
      const acquireResponse = await axios.post(`https://api.agora.io/v1/apps/${this.agoraConfig.appId}/cloud_recording/acquire`, {
        cname: channelName,
        uid: uid,
        clientRequest: {
          resourceExpiredHour: 24,
        },
      }, {
        headers: this.getHeaders(),
      });

      const resourceId = acquireResponse.data.resourceId;

      // Start the recording
      const startResponse = await axios.post(`https://api.agora.io/v1/apps/${this.agoraConfig.appId}/cloud_recording/resourceid/${resourceId}/mode/mix/start`, {
        cname: channelName,
        uid: uid,
        clientRequest: {
          token: this.generateToken(channelName, uid),
          recordingConfig: {
            maxIdleTime: 30,
            streamTypes: 2,
            channelType: 0,
            videoStreamType: 0,
            transcodingConfig: {
              width: 640,
              height: 360,
              fps: 30,
              bitrate: 600,
              mixedVideoLayout: 1,
            },
          },
          storageConfig: {
            vendor: 0, // 0 for temporary storage on Agora servers
          },
        },
      }, {
        headers: this.getHeaders(),
      });

      const sid = startResponse.data.sid;
      this.logger.log(`Started recording with SID: ${sid}`);

      return { resourceId, sid };
    } catch (error) {
      this.logger.error('Error starting recording:', error.response?.data || error.message);
      throw error;
    }
  }

  async stopRecording(channelName: string, uid: string, resourceId: string, sid: string): Promise<void> {
    try {
      await axios.post(`https://api.agora.io/v1/apps/${this.agoraConfig.appId}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/stop`, {
        cname: channelName,
        uid: uid.toString(),
        clientRequest: {},
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.agoraConfig.customerKey}:${this.agoraConfig.customerSecret}`).toString('base64')}`,
        },
      });

      this.logger.log(`Stopped recording with SID: ${sid}`);
    } catch (error) {
      this.logger.error('Error stopping recording:', error.response?.data || error.message);
      throw error;
    }
  }

  async queryRecording(channelName: string, uid: string, resourceId: string, sid: string): Promise<any> {
    try {
      const response = await axios.get(`https://api.agora.io/v1/apps/${this.agoraConfig.appId}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/query`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.agoraConfig.customerKey}:${this.agoraConfig.customerSecret}`).toString('base64')}`,
        },
      });

      this.logger.log(`Queried recording status for SID: ${sid}`);
      return response.data;
    } catch (error) {
      this.logger.error('Error querying recording:', error.response?.data || error.message);
      throw error;
    }
  }

  async downloadRecording(recordingInfo: { resourceId: string; sid: string; channelName: string; uid: string }): Promise<Readable> {
    try {
      const queryResult = await this.queryRecording(
        recordingInfo.channelName,
        recordingInfo.uid,
        recordingInfo.resourceId,
        recordingInfo.sid
      );

      if (queryResult.serverResponse.fileList && queryResult.serverResponse.fileList.length > 0) {
        const fileUrl = queryResult.serverResponse.fileList[0].fileName;
        const response = await axios.get(fileUrl, { responseType: 'stream' });
        return response.data;
      } else {
        throw new Error('Recording file not found');
      }
    } catch (error) {
      this.logger.error('Error downloading recording:', error.response?.data || error.message);
      throw error;
    }
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${this.agoraConfig.customerKey}:${this.agoraConfig.customerSecret}`).toString('base64')}`,
    };
  }

}