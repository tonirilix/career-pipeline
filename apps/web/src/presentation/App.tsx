import { applicationStages } from "../domain/applicationStage";
import "./App.css";

export function App() {
  return (
    <main className="app-shell">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Pipeline workspace</p>
          <h1>Job Application Tracker</h1>
        </div>
        <button type="button">Add opportunity</button>
      </header>

      <section
        aria-label="Application pipeline"
        className="pipeline-board"
      >
        {applicationStages.map((stage) => (
          <article className="stage-column" key={stage}>
            <header>
              <h2>{stage}</h2>
              <span aria-label={`${stage} applications`}>0</span>
            </header>
            <p>No applications yet</p>
          </article>
        ))}
      </section>
    </main>
  );
}
