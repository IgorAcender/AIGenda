// Mock data para testes sem database
const MOCK_INSTANCES = [
  { id: 1, name: 'evolution-1', url: 'http://evolution-1:8001', maxConnections: 100, tenantCount: 45, isActive: true, occupancyPercent: 45 },
  { id: 2, name: 'evolution-2', url: 'http://evolution-2:8002', maxConnections: 100, tenantCount: 62, isActive: true, occupancyPercent: 62 },
  { id: 3, name: 'evolution-3', url: 'http://evolution-3:8003', maxConnections: 100, tenantCount: 38, isActive: true, occupancyPercent: 38 },
  { id: 4, name: 'evolution-4', url: 'http://evolution-4:8004', maxConnections: 100, tenantCount: 71, isActive: true, occupancyPercent: 71 },
  { id: 5, name: 'evolution-5', url: 'http://evolution-5:8005', maxConnections: 100, tenantCount: 29, isActive: true, occupancyPercent: 29 },
  { id: 6, name: 'evolution-6', url: 'http://evolution-6:8006', maxConnections: 100, tenantCount: 55, isActive: true, occupancyPercent: 55 },
  { id: 7, name: 'evolution-7', url: 'http://evolution-7:8007', maxConnections: 100, tenantCount: 84, isActive: true, occupancyPercent: 84 },
  { id: 8, name: 'evolution-8', url: 'http://evolution-8:8008', maxConnections: 100, tenantCount: 41, isActive: true, occupancyPercent: 41 },
  { id: 9, name: 'evolution-9', url: 'http://evolution-9:8009', maxConnections: 100, tenantCount: 93, isActive: true, occupancyPercent: 93 },
  { id: 10, name: 'evolution-10', url: 'http://evolution-10:8010', maxConnections: 100, tenantCount: 17, isActive: true, occupancyPercent: 17 },
];

const MOCK_STATUSES = {};

export const mockData = {
  instances: MOCK_INSTANCES,
  statuses: MOCK_STATUSES,
};
