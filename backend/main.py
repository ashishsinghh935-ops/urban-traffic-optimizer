from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
import numpy as np

# 1. Initialize the FastAPI application
app = FastAPI(
    title="Urban Traffic Flow API",
    description="Backend engine for calculating optimal traffic routing using linear algebra.",
    version="1.0.0"
)

# 2. Configure CORS (Cross-Origin Resource Sharing)
# This allows your Next.js frontend to securely send data to this backend without security blocks.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Note: In production on Vercel, replace "*" with your specific web domain.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Define Pydantic Data Models
# These ensure the React frontend sends the exact matrix and vector structures we need.
class TrafficNetworkRequest(BaseModel):
    incidence_matrix: List[List[float]] = Field(
        ..., 
        description="The A matrix in Ax = b, representing intersection connections (inflows/outflows)."
    )
    external_inflows: List[float] = Field(
        ..., 
        description="The b vector, representing net traffic entering or leaving each node."
    )

class TrafficNetworkResponse(BaseModel):
    status: str
    optimized_flows: List[float]
    bottlenecks_detected: bool
    message: str

# 4. Define API Endpoints

@app.get("/", tags=["Health Check"])
def read_root():
    """
    Basic health check endpoint to confirm the server is running locally or on Render.
    """
    return {"status": "online", "message": "Traffic Optimizer FastAPI Engine is locked and loaded!"}

@app.post("/optimize", response_model=TrafficNetworkResponse, tags=["Optimization Engine"])
def optimize_traffic(network_data: TrafficNetworkRequest):
    """
    Core endpoint that receives network data from React and solves the traffic flow equations.
    """
    try:
        # Extract the matrices from the validated incoming JSON request
        A = np.array(network_data.incidence_matrix)
        b = np.array(network_data.external_inflows)
        
        # Validation: Check if matrix dimensions align (Rows in A must match length of b)
        if A.shape[0] != b.shape[0]:
            raise HTTPException(
                status_code=400, 
                detail="Matrix dimensions do not match. Rows in the incidence matrix must equal the length of the external inflows vector."
            )

        # Solve the system Ax = b for x (the internal routing flows)
        # We use np.linalg.lstsq (Least Squares) to safely handle overdetermined or underdetermined traffic grids
        x, residuals, rank, s = np.linalg.lstsq(A, b, rcond=None)
        
        # Format the output flows (rounding to 2 decimal places for a clean React UI display)
        optimized_flows = [round(float(flow), 2) for flow in x]
        
        # Simple bottleneck detection: if any routing volume exceeds a threshold (e.g., 100 units), flag it
        threshold = 100.0
        bottleneck_flag = any(flow > threshold for flow in optimized_flows)

        # Return the structured data back to the Next.js frontend
        return TrafficNetworkResponse(
            status="success",
            optimized_flows=optimized_flows,
            bottlenecks_detected=bottleneck_flag,
            message="Traffic network optimized successfully."
        )

    except Exception as e:
        # Catch any mathematical or processing errors and send a clean error code back to the frontend
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")