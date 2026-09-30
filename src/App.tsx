import { DashboardScreen } from "./components/dashboard/DashboardScreen";
import { useCostDb } from "./hooks/useCostDb";
import "./styles.css";

export default function App() {
  const { data, loading, error, reload } = useCostDb();

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
