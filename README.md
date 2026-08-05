# 🚦 Urban Traffic Flow & Route Optimization Solver

A full-stack mathematical modeling application designed to optimize urban traffic networks, simulate intersection flow conservation, and detect bottlenecks using linear algebra and graph theory.

![Live on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)
![Live on Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)
![Next.js](https://img.shields.io/badge/Frontend-Next.js-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/API-FastAPI-009688?logo=fastapi)

## 🌟 Live Demo
**[Launch the Live Dashboard Here]**urban-traffic-optimizer.vercel.app/

---

## 🏗️ Architecture & Tech Stack

This project was recently migrated from a monolithic Streamlit script into a modern, decoupled full-stack architecture:

*   **Frontend (`/frontend`):** Built with **Next.js**, **React**, **Tailwind CSS**, and **React Flow**. Provides a highly interactive, drag-and-drop node canvas for users to map out custom intersection topologies.
*   **Backend (`/backend`):** Built with **Python**, **FastAPI**, and **NumPy**. Acts as the dedicated math engine, receiving incidence matrices from the frontend, calculating flow conservation ($Ax = b$), and returning optimized routing data.
*   **Legacy Simulation:** Contains the original `traffic_simulator.m` MATLAB script for offline, high-precision mathematical modeling.

## 🚀 Key Features
*   **Interactive Node Graphing:** Dynamically add intersections and connect roads via a visually intuitive UI.
*   **Real-Time Math Engine:** Instantly calculates optimized traffic flows across complex networks using matrix math.
*   **Dynamic Bottleneck Detection:** Visually highlights roads that exceed user-defined capacity limits in red.

---

## 💻 Running the Project Locally

To run this project on your local machine, you will need to start both the backend and frontend servers.

### 1. Start the FastAPI Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
