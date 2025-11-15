import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { mockUsers, allMockConnections } from './data';
import { UserData, ConsumptionDataPoint, ForecastDataPoint, HistoricProductCostPoint, ProductType } from './types';

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve Frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '..')));

// API Endpoints

app.get('/api', (req: Request, res: Response) => {
  res.send('✅ Aansluitregister Backend is running');
});

app.post('/api/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    const isValidPassword = (user: UserData, pass: string) => {
        if (user.email === '1@1.com' && pass === '1') return true;
        if (user.email === '2@2.com' && pass === '2') return true;
        return false;
    };

    if (user && isValidPassword(user, password)) {
        console.log(`Successfully authenticated user: ${user.name}`);
        res.status(200).json(user);
    } else {
        console.log(`Failed login attempt for email: ${email}`);
        res.status(401).json({ message: 'Invalid email or password. Please use one of the demo accounts.' });
    }
});

app.get('/api/consumption', (req: Request, res: Response) => {
    const { startDate, endDate, granularity } = req.query;
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    const data: ConsumptionDataPoint[] = [];
    let currentDate = new Date(start);

    if (granularity === 'day') {
        while (currentDate <= end) {
            data.push({ date: currentDate.toISOString().split('T')[0], usage: parseFloat((Math.random() * 20).toFixed(2)) });
            currentDate.setDate(currentDate.getDate() + 1);
        }
    } else if (granularity === 'month') {
        currentDate = new Date(start.getFullYear(), start.getMonth(), 1);
        while (currentDate <= end) {
            data.push({ date: currentDate.toISOString().split('T')[0], usage: parseFloat((Math.random() * 600).toFixed(2)) });
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
    } else if (granularity === 'year') {
        currentDate = new Date(start.getFullYear(), 0, 1);
        while (currentDate <= end) {
            data.push({ date: currentDate.toISOString().split('T')[0], usage: parseFloat((Math.random() * 7000).toFixed(2)) });
            currentDate.setFullYear(currentDate.getFullYear() + 1);
        }
    }
    res.json(data);
});

app.get('/api/forecasts', (req: Request, res: Response) => {
    const { product } = req.query;
    const data: ForecastDataPoint[] = [];
    const today = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let commodityBase = 80;
    let nonCommodityBase = 20;

    switch (product) {
        case ProductType.ELEKTRA: commodityBase = 120; nonCommodityBase = 40; break;
        case ProductType.GAS: commodityBase = 90; nonCommodityBase = 30; break;
        case ProductType.WATER: commodityBase = 30; nonCommodityBase = 15; break;
        case 'All': default: commodityBase = 240; nonCommodityBase = 85; break;
    }

    for (let i = 0; i < 12; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
        data.push({
            month: `${monthNames[date.getMonth()]} '${date.getFullYear().toString().substring(2)}`,
            commodity: parseFloat((Math.random() * (commodityBase / 2) + commodityBase).toFixed(2)),
            nonCommodity: parseFloat((Math.random() * (nonCommodityBase / 2) + nonCommodityBase).toFixed(2))
        });
    }
    res.json(data);
});

app.get('/api/costs/historic/all', (req: Request, res: Response) => {
    const data: HistoricProductCostPoint[] = [];
    const today = new Date();
    for(let i=11; i>=0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        data.push({
            date: date.toISOString().split('T')[0],
            [ProductType.ELEKTRA]: parseFloat((Math.random() * 5000 + 2000).toFixed(2)),
            [ProductType.GAS]: parseFloat((Math.random() * 3000 + 1500).toFixed(2)),
            [ProductType.WATER]: parseFloat((Math.random() * 800 + 400).toFixed(2)),
        });
    }
    res.json(data);
});

app.get('/api/costs/historic/:connectionId', (req: Request, res: Response) => {
    const { connectionId } = req.params;
    const connection = allMockConnections.find(c => c.id === connectionId);
    if (!connection) {
        return res.status(404).json({ message: `Connection with ID ${connectionId} not found.` });
    }

    const data: HistoricProductCostPoint[] = [];
    const today = new Date();
    
    const productsInConnection = new Set<ProductType>();
    connection.meters.forEach(meter => productsInConnection.add(meter.type));
    productsInConnection.add(connection.product);

    for (let i = 11; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const point: HistoricProductCostPoint = { date: date.toISOString().split('T')[0], [ProductType.ELEKTRA]: 0, [ProductType.GAS]: 0, [ProductType.WATER]: 0 };
        if (productsInConnection.has(ProductType.ELEKTRA)) point[ProductType.ELEKTRA] = parseFloat((Math.random() * 400 + 50).toFixed(2));
        if (productsInConnection.has(ProductType.GAS)) point[ProductType.GAS] = parseFloat((Math.random() * 300 + 40).toFixed(2));
        if (productsInConnection.has(ProductType.WATER)) point[ProductType.WATER] = parseFloat((Math.random() * 100 + 20).toFixed(2));
        data.push(point);
    }
    
    res.json(data);
});

app.listen(port, () => {
  console.log(`🚀 Backend server running at http://localhost:${port}`);
  console.log(`✅ Frontend is available at http://localhost:${port}`);
});
