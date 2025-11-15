export interface ConsumptionDataPoint {
  date: string;
  usage: number; // in kWh for electricity, m³ for gas
}

export interface ForecastDataPoint {
    month: string;
    commodity: number;
    nonCommodity: number;
}

export interface HistoricProductCostPoint {
    date: string;
    [ProductType.ELEKTRA]: number;
    [ProductType.GAS]: number;
    [ProductType.WATER]: number;
}

export enum ProductType {
  WATER = 'Water',
  ELEKTRA = 'Elektra',
  GAS = 'Gas'
}

export enum ConnectionType {
    LARGE = 'Large',
    SMALL = 'Small'
}

export enum ConnectionStatus {
    ACTIVE = 'Active',
    INACTIVE = 'Inactive'
}

export interface SupplierInfo {
    name: string;
    startDate: string;
    endDate: string;
    contact: string;
}

export interface NetworkOperatorInfo {
    name: string;
    contact: string;
}

export interface TechnicalData {
    capacity: string;
    physicalStatus: string;
}

export interface Meter {
  id: string;
  type: ProductType;
  meterType: 'Smart' | 'Conventional';
  registrationReading: number;
  lastReading: number;
  lastReadingDate: string;
  unit: 'kWh' | 'm³';
}

export interface Note {
  text: string;
  user: string;
  date: string;
}

export interface EditHistoryEntry {
  date: string;
  user: string;
  snapshot: Connection;
}

export interface Connection {
  id:string;
  product: ProductType;
  status: ConnectionStatus;
  client: string;
  department: string;
  connectionName: string;
  ean: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  latitude: number;
  llongitude: number;
  connectionType: ConnectionType;
  meters: Meter[];
  consumption: ConsumptionDataPoint[];
  supplierInfo: SupplierInfo;
  networkOperatorInfo: NetworkOperatorInfo;
  technicalData: TechnicalData;
  notes?: Note[];
  editHistory?: EditHistoryEntry[];
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  connections: Connection[];
  accessibleClients: string[];
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: GroundingSource[];
}
