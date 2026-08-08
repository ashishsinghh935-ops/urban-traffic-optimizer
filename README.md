# 🚦 Urban Traffic Flow Optimizer

A full-stack, multi-page web application designed to model, analyze, and optimize urban traffic networks using applied linear algebra. 

Unlike standard simulation tools that rely on random heuristics, this engine translates physical street grids into formal mathematical vector spaces. By computing the Moore-Penrose pseudo-inverse of network incidence matrices, the system calculates the exact optimal traffic flow required across every road to maintain perfect mass conservation and prevent gridlock.

## ✨ Key Features

* **Interactive Network Builder:** A drag-and-drop canvas (powered by React Flow) allowing users to construct custom city grids, define inflow/outflow boundary conditions, and set bottleneck thresholds.
* **Real-World Topologies:** Includes highly accurate, pre-configured structural grids of complex Delhi locations:
  * **Delhi University North Campus:** A 9-node, 13-edge network modeling student commute flows from Vishwavidyalaya Metro through GTB Road, Arts Faculty, SRCC, and Hansraj.
  * **Connaught Place:** A massive 11-node, 20-edge concentric radial grid modeling the Inner Circle, Outer Circle, and connecting radials of Rajiv Chowk.
* **Rigorous Mathematical Engine:** A Python/FastAPI backend that converts graph topologies into systems of linear equations and utilizes Singular Value Decomposition (SVD) for least-squares optimization.
* **Dynamic Matrix Analysis:** A dedicated deep-dive view (`/the-math`) that intercepts the live session data to generate real-time Incidence Matrices ($A$), Boundary Vectors ($b$), and Augmented Matrices $[A \mid b]$ based on the user's specific inputs.

## 🧮 The Mathematics

The core logic of the optimizer is rooted in foundational linear algebra principles (e.g., David C. Lay's *Linear Algebra and Its Applications*). 

1. **The Incidence Matrix ($A$):** The network is mapped into a matrix where rows represent intersections and columns represent roads. Entries of `1`, `-1`, and `0` denote the origination, termination, or absence of a road at a given node.
2. **Flow Conservation ($Ax = b$):** To prevent bottlenecks, the volume of vehicles entering an intersection must equal the volume leaving. $b$ represents the external boundary inflows/outflows, and $x$ represents the unknown flow on each internal road.
3. **Least-Squares Optimization:** Real-world networks with loops (like Connaught Place) possess non-trivial null spaces, making standard matrix inversion impossible. The engine solves the normal equations:
   $$A^T A x = A^T b$$
   By calculating the pseudo-inverse via SVD, the backend finds the vector $x$ that minimizes the Euclidean norm $||Ax - b||$, producing the most balanced distribution of vehicles.

## 🛠️ Tech Stack

**Frontend:**
* Next.js / React
* React Flow (Graph Visualization)
* Tailwind CSS
* Deployed on Vercel

**Backend:**
* Python
* FastAPI
* NumPy (Matrix Operations & SVD)
* Deployed on Render

## 🚀 Running Locally

### 1. Start the Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

2. Start the Frontend (Next.js)
cd frontend
npm install
npm run dev
Open http://localhost:3000 in your browser to view the application

