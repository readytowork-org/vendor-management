// Data source switch, set by VITE_COSTDB_SOURCE.

import type { CostDbRepository } from "./CostDbRepository";
import { MockCostDbRepository } from "./mock/MockCostDbRepository";
import { VendorManagementDataverseRepository } from "./dataverse/VendorManagementDataverseRepository";

const source = import.meta.env.VITE_COSTDB_SOURCE ?? (import.meta.env.PROD ? "dataverse" : "mock");

export const costDbRepository: CostDbRepository =
  source === "dataverse"
    ? new VendorManagementDataverseRepository()
    : new MockCostDbRepository();

export type { CostDbRepository } from "./CostDbRepository";
