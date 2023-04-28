import { Route } from './@shared/interface/route.interface'
import express, { NextFunction, Request, Response } from 'express';
import * as path from 'path';
import { PaymentTaskService } from './@app/services/payment-task.service';

class App {
    public app: express.Application;
    public port: (string | number);
    public env: boolean;

    constructor(routes: Array<Route>) {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.env = process.env.NODE_ENV === 'production' ? true : false;

        // this.connectToDatabase();
        this.initializeMiddlewares();
        this.initializeRoutes(routes);
        this.serveApp();
        new PaymentTaskService().runTask();
        // this.initializeErrorHandling();
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`🚀 App listening on the port ${this.port}`);
        });
    }

    public getServer() {
        return this.app;
    }

    private initializeMiddlewares() {
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

        this.app.use((req: Request, res: Response, next: NextFunction) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header(
                "Access-Control-Allow-Headers",
                "*"
            );
            if (req.method == 'OPTIONS') {
                res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE');
                return res.status(200).json({});
            }
            next();
        });
    }

    private initializeRoutes(routes: Array<Route>) {
        routes.forEach((route) => {
            this.app.use('/api', route.router);
        });
    }

    serveApp() {
      //  if (process.env.NODE_ENV === 'production') {
            // Set static folder
            this.app.use(express.static(path.join(__dirname, '../web')));

            this.app.get('*', (req, res) => {
                res.sendFile(path.join(__dirname, '../web/landing-software-dev-agency-v3.html'));
            });
    //    }
    }
}

export default App;
