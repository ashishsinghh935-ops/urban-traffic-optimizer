# FlowOptimizer 🚦

FlowOptimizer is a full-stack, high-fidelity urban traffic modeling and simulation tool. It treats city infrastructure as a vector space, translating physical intersections and roads into systems of linear equations to calculate perfect mass-conserved traffic flow.

Live Deployment: [urban-traffic-optimizer.vercel.app](https://urban-traffic-optimizer.vercel.app)

---

## 🚀 Core Features

*   **Dynamic Origin-Destination (OD) Matrix:** Configure independent net boundary conditions for every intersection. Generate traffic (sources), absorb traffic (sinks), or maintain strict pass-through conservation.
*   **Live Mass Conservation Validation:** The UI strictly enforces physical laws. The engine mathematically locks unless the total boundary vector balances perfectly to zero ($\sum b_i = 0$).
*   **"What-If" Scenario Tester:** Click any edge on the map to block a road (simulating accidents or construction). The algorithm dynamically removes the vector and reroutes traffic on the fly.
*   **Pre-Flight Topology Checks:** Built-in graph traversal prevents the submission of mathematical sinkholes or vacuum nodes (e.g., generating traffic with no outbound roads).
*   **Data Export (CSV):** Extract the generated Incidence Matrix ($A$), Boundary Vector ($b$), and Optimized Flow Vector ($x$) for external academic or operational research.

## ✨ UI / UX & Visualization

*   **Cinematic SVD Terminal Sequence:** A glassmorphic terminal overlay that simulates real-time linear algebra execution ($A^T A x = A^T b$, SVD pseudo-inverse calculation) before rendering telemetry.
*   **Dynamic Traffic Pulse Animation:** Roads visually pulse with telemetry data. Stroke thickness, color, and dash speed map directly to volume severity—showing smooth blue streams for efficiency and crawling crimson red pulses for bottlenecks.
*   **Telemetry HUD with Custom SVG Gauges:** Real-time visual tracking of Total System Flow, Peak Volume vs. Capacity, and Active Bottlenecks using zero-dependency, pure math SVG radial gauges.
*   **CAD Minimap & Hover Tooltips:** Integrated React Flow minimap for large-scale grid navigation, paired with instant glassmorphic cursor tooltips detailing exact edge/node telemetry on hover.
*   **Focus Mode (Universal Collapse):** Detached, glassmorphic floating configuration panels that can be slid out of view for an unobstructed, full-screen viewport of the network map. Auto-hides during engine execution.
*   **Buttery-Smooth Architecture:** Powered by Framer Motion page transitions, Sonner toast notifications, and custom typography (**Inter** & **JetBrains Mono**).
*   **Mobile-First Engineering:** Fully responsive layout featuring collapsible off-canvas mobile drawers and top-nav toggles, ensuring seamless network configuration on any device.

## 🧮 The Mathematics

This engine does not rely on simple heuristics; it uses applied linear algebra to model traffic based on **Wardrop's first principle of traffic equilibrium**. 

1.  **The Incidence Matrix ($A$):** The React Flow topography is flattened into a matrix where rows represent intersections and columns represent roads. Directional connectivity is mapped using $1$ (origin), $-1$ (termination), and $0$ (unconnected).
2.  **The Boundary Vector ($b$):** User inputs construct a unified boundary vector representing the net volume at each intersection. 
3.  **The Optimization Engine:** Because real-world urban grids contain cyclic loops and are mathematically overdetermined, standard matrix inversion ($A^{-1}$) fails. The Python back-end solves the normal equations:
    $$A^T A x = A^T b$$
    Using the **Moore-Penrose Pseudo-inverse** via Singular Value Decomposition (SVD), the engine calculates the exact flow vector ($x$) that minimizes the Euclidean norm $||Ax - b||^2$, preventing gridlock while conserving mass.

## 🛠 Tech Stack

**Front-End:**
*   **Next.js (React):** App router architecture with Framer Motion transitions.
*   **React Flow:** Interactive, node-based topography canvas with CAD Minimap.
*   **Tailwind CSS & Sonner:** Professional styling, glassmorphism, UI styling, and animated toast notifications.

**Back-End:**
*   **Python & FastAPI:** High-performance, stateless math engine.
*   **NumPy:** Core linear algebra processing, SVD computation, and matrix manipulation.

## 🗺 Included Topologies

The app includes hardcoded, geographically accurate presets for analyzing real-world stress points:
*   **IGI Airport Connector:** Models the high-stakes highway interchanges between Dhaula Kuan, NH-48, and Terminals 1 & 3.
*   **Connaught Place Grid:** Models the radial concentric flow of Delhi's central business district.
*   **DU North Campus:** Models student commute flows through Vishwavidyalaya Metro, Arts Faculty, and adjacent roads.

## 💻 Local Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/ashishsinghh935-ops/urban-traffic-optimizer.git](https://github.com/ashishsinghh935-ops/urban-traffic-optimizer.git)
   cd urban-traffic-optimizer
   ```

2. **Start the Python Engine:**
   ```cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
  ```
3. **Start the Next.js Client:**
  ``` cd ../frontend
   npm install
   npm run dev
   ```

4. **Open http://localhost:3000 to access the dashboard.**