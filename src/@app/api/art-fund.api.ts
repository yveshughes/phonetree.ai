import AWS, { S3 } from 'aws-sdk';
import { SfAccountArtFunDto, URL } from 'cybersafepolicy-core';
import { Request, Response, Router } from 'express';
import multer from 'multer';
import { ArtFundService } from '../../@app/services/art-fund.service';
import { Route } from '../../@shared/interface/route.interface';
import { ResponseUtility } from '../../@shared/utility/response.utility';
import * as dotenv from "dotenv";

var storage = multer.memoryStorage()
var upload = multer({ storage: storage });
const uploadDocument = upload.single('document');

dotenv.config();
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET,
  region: process.env.AWS_REGION
});

class ArtFundApi implements Route {
  public path = URL.MJR_ART_FUND;
  public router = Router();

  private artFundService = new ArtFundService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // /api/core/v1/art-fund/add-update
    this.router.post(`${this.path}${URL.ADD_UPDATE}`, async (req: Request, res: Response) => {
      try {
        if (!req.body) {
          ResponseUtility.sendFailResponse(res, null, 'Body Required');
          return;
        }
        const dto: SfAccountArtFunDto = req.body as SfAccountArtFunDto;
        dto.acc = this._sanatizeBody(dto.acc);
        dto.artFund = this._sanatizeBody(dto.artFund);
        const fund: SfAccountArtFunDto = await this.artFundService.addUpdateArtFund(dto);
        ResponseUtility.sendSuccess(res, fund);
      } catch (error) {
        console.log(error);
        ResponseUtility.sendFailResponse(res, error);
      }
    });

    // /api/core/v1/art-fund/detail
    this.router.get(`${this.path}${URL.DETAIL}`, async (req: Request, res: Response) => {
      try {
        if (!req.query || !req.query.userId) {
          ResponseUtility.sendFailResponse(res, 'Required userId');
          return;
        }
        const ret = await this.artFundService.getDetail(req.query.userId as string);
        ResponseUtility.sendSuccess(res, ret);
      } catch (error) {
        console.log(error);
        ResponseUtility.sendFailResponse(res, error);
      }
    });

    // /api/core/v1/art-fund/detail
    this.router.get(`${this.path}/picklist`, async (req: Request, res: Response) => {
      try {
        const dsc = await this.artFundService.description();
        const ret = {} as any;
        dsc.fields.forEach((f: any) => {
          if (f.type === 'picklist' || f.type == 'multipicklist') {
            ret[f.name] = f.picklistValues;
          }
        });
        ResponseUtility.sendSuccess(res, ret);
      } catch (error) {
        console.log(error);
        ResponseUtility.sendFailResponse(res, error);
      }
    });

    // /api/core/v1/memo/media
    this.router.post(`${this.path}/media`, uploadDocument, (req, res) => {
      dotenv.config();
      const params = {
        Bucket: process.env.AWS_BUCKET,
        acl: 'public',
        Key: `public/${req.body.dir}/${req.body.key}`,
        Body: req.file?.buffer
      };

      s3.upload(params as S3.Types.PutObjectRequest, (err: any, data: any) => {
        if (err) {
          res.status(500).send("Error -> " + err);
        }
        res.send("File uploaded successfully! -> keyname = " + req.file?.originalname);
      });
    });

    this.router.delete(`${this.path}/media`, uploadDocument, (req, res) => {
      dotenv.config();
      const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: `public/${req.query.dir}/${req.query.key}`,
      };

      s3.deleteObject(params as S3.Types.DeleteObjectRequest, (err: any, data: any) => {
        if (err) {
          ResponseUtility.sendFailResponse(res, false, JSON.stringify(err));
          return;
        }
        ResponseUtility.sendSuccess(res, true, "File deleted successfully!");
      });
    });

    
  }

  

  private _sanatizeBody(body: any): any {
    if (!body) {
      return;
    }
    if (body.LastModifiedDate) {
      delete body.LastModifiedDate;
    }
    if (body.CreatedById) {
      delete body.CreatedById;
    }
    if (body.IsDeleted == true || body.IsDeleted == false) {
      delete body.IsDeleted;
    }
    if (body.LastViewedDate) {
      delete body.LastViewedDate;
    }
    if (body.CreatedDate) {
      delete body.CreatedDate;
    }
    if (body.LastReferencedDate) {
      delete body.LastReferencedDate;
    }
    if (body.SystemModstamp) {
      delete body.SystemModstamp;
    }
    if (body.LastModifiedById) {
      delete body.LastModifiedById;
    }
    return body;
  }
}

export default ArtFundApi;
