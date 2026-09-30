import { DashboardScreen } from "./components/dashboard/DashboardScreen";
import { useCostDb } from "./hooks/useCostDb";
import { usePowerAppsContext } from "./hooks/usePowerAppsContext";
import "./styles.css";

export default function App() {
  const { context, loading: contextLoading } = usePowerAppsContext();
  const { data, loading, error, reload, source } = useCostDb(Boolean(context));

  if (source === "dataverse" && !context) {
    return (
      <main className="content dashboard-only">
        <div className="screen">
          <div className="tilegrid">
            <section className="tile span6">
              <div className="tile-head">
                <h2 className="tile-title">
                  {contextLoading ? "Connecting to Power Apps" : "Power Apps context required"}
                </h2>
              </div>
              <div className="tile-body">
                <div className="empty">
                  {contextLoading
                    ? "Waiting for the Power Apps host connection..."
                    : "Open this dashboard using the Local Play link from npm run dev. Direct localhost access cannot authenticate to Dataverse."}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="content dashboard-only">
      {error && (
        <div className="screen">
          <div className="tilegrid">
            <section className="tile span6">
              <div className="tile-head">
                <h2 className="tile-title">Failed to load data</h2>
              </div>
              <div className="tile-body">
                <div className="empty">{error}</div>
              </div>
            </section>
          </div>
        </div>
      )}

      {!error && loading && !data && (
        <div className="screen">
          <div className="tilegrid">
            <section className="tile span6">
              <div className="tile-body">
                <div className="empty">Loading data...</div>
              </div>
            </section>
          </div>
        </div>
      )}

      {!error && data && (
        <DashboardScreen
          masters={data.masters}
          items={data.items}
          onRefresh={reload}
          onDemoAction={() => undefined}
        />
      )}
    </main>
  );
}
