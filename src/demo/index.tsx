import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { PixelOfficeCanvas, type CameraAgent } from "../ui/PixelOfficeCanvas.js";
import "./styles.css";

type CameraId = "office" | "boardroomKitchen" | "overflowOffice";

const cameras: Array<{ id: CameraId; label: string; room: string }> = [
  { id: "office", label: "Camera 1", room: "Office + Lounge" },
  { id: "boardroomKitchen", label: "Camera 2", room: "Boardroom + Staff Kitchen" },
  { id: "overflowOffice", label: "Camera 3", room: "Overflow Office + Lounge" },
];

const agents: CameraAgent[] = [
  { id: "maya-product", name: "Maya", activityKind: "writing", characterIndex: 7 },
  { id: "theo-engineering", name: "Theo", activityKind: "coding", characterIndex: 22 },
  { id: "lena-research", name: "Lena", activityKind: "research", characterIndex: 34 },
  { id: "omar-design", name: "Omar", activityKind: "meeting", characterIndex: 48 },
  { id: "jun-operations", name: "Jun", activityKind: "coding", characterIndex: 61 },
  { id: "cass-support", name: "Cass", activityKind: "idle", characterIndex: 75 },
  { id: "niko-growth", name: "Niko", activityKind: "writing", characterIndex: 13 },
  { id: "rhea-quality", name: "Rhea", activityKind: "research", characterIndex: 29 },
];

function App() {
  const [camera, setCamera] = useState<CameraId>("office");
  const currentCamera = cameras.find((item) => item.id === camera) ?? cameras[0];
  const workingCount = agents.filter((agent) => agent.activityKind !== "idle").length;

  return (
    <main className="app-shell">
      <header className="camera-header">
        <div className="identity">
          <img src="./assets/brand/agent-pixels-logo.svg" alt="Agent Pixels" />
          <div>
            <p>{currentCamera.room}</p>
            <span>Standalone production renderer · synthetic demo data</span>
          </div>
        </div>

        <div className="camera-controls" aria-label="Camera controls">
          <div className="camera-tabs">
            {cameras.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={camera === item.id}
                onClick={() => setCamera(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="live-status" role="status">
            <span aria-hidden="true" />
            Live · {workingCount} active
          </div>
        </div>
      </header>

      <section className="camera-frame" aria-label={`${currentCamera.room} camera`}>
        <PixelOfficeCanvas camera={camera} agents={agents} />
        <div className="scanlines" aria-hidden="true" />
        <div className="camera-stamp" aria-hidden="true">
          <span>AGENT PIXELS</span>
          <span>{currentCamera.label.toUpperCase()}</span>
        </div>
      </section>
    </main>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Demo root element was not found");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
