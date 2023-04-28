import { Router, NextFunction, Request, Response } from 'express';
import { Route } from '../../@shared/interface/route.interface';

class IndexApi implements Route {
  public path = '/';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, async (req: Request, res: Response, next: NextFunction) => {
      try {
        res.status(200).json({
          "xx": "xxxxxxxxxx"
        });
      } catch (error) {
        next(error);
      }
    });
  }
}

export default IndexApi;
