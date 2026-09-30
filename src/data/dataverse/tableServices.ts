// The only place that touches src/generated.

/** Options accepted by a generated getAll. */
export interface IGetAllOptions {
  /** Max rows per page. */
  maxPageSize?: number;
  /** Columns to fetch. Always pass this. */
  select?: string[];
  /** OData $filter string. */
  filter?: string;
  /** Sort order, e.g. ["cr123_no asc"]. */
  orderBy?: string[];
  /** Row limit. */
  top?: number;
  /** Rows to skip. */
  skip?: number;
  /** Paging token. */
  skipToken?: string;
}

/** Return shape of every generated service call. */
export interface ServiceResult<T> {
  data?: T;
  success?: boolean;
  error?: { message?: string };
}

/** A Dataverse row is an open bag of columns. */
export type DataverseRow = Record<string, unknown>;

export interface TabularService<TRow extends DataverseRow = DataverseRow> {
  getAll(options?: IGetAllOptions): Promise<ServiceResult<TRow[]>>;
  get(id: string): Promise<ServiceResult<TRow>>;
  create(record: Partial<TRow>): Promise<ServiceResult<TRow>>;
  update(id: string, changes: Partial<TRow>): Promise<ServiceResult<TRow>>;
  delete(id: string): Promise<ServiceResult<unknown>>;
}

/** Everything under src/generated/services. Empty until the CLI runs. */
const generatedServices = import.meta.glob<Record<string, unknown>>(
  "../../generated/services/*Service.ts",
  { eager: true },
);

/** Converts an entity set name to the generated service export name. */
function serviceName(entitySetName: string): string {
  return entitySetName.charAt(0).toUpperCase() + entitySetName.slice(1) + "Service";
}

/** Throws the command to run, rather than []. */
function notGenerated(tableLogicalName: string): TabularService {
  const fail = (): never => {
    throw new Error(
      `[Vendor Management] No generated service for Dataverse table "${tableLogicalName}".`,
    );
  };
  return {
    getAll: fail,
    get: fail,
    create: fail,
    update: fail,
    delete: fail,
  };
}

/** Binds a table to its generated service, or to a stub that explains itself. */
export function serviceFor(table: {
  logicalName: string;
  entitySetName: string;
}): TabularService {
  const name = serviceName(table.entitySetName);
  for (const [path, module] of Object.entries(generatedServices)) {
    if (!path.endsWith(`/${name}.ts`)) continue;
    const exported = module[name];
    if (exported) return exported as unknown as TabularService;
  }
  return notGenerated(table.logicalName);
}

/** Unwraps getAll, throwing rather than hiding. */
export async function rowsOf(
  service: TabularService,
  options: IGetAllOptions,
): Promise<DataverseRow[]> {
  const result = await service.getAll(options);
  if (result.error) {
    throw new Error(result.error.message ?? "Failed to read from Dataverse.");
  }
  return result.data ?? [];
}

