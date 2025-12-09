from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import numpy as np
import uvicorn
import sys

class MatrixInput(BaseModel):
    matrix: List[List[float]]

app = FastAPI(title="Matrix MCP")

@app.post("/tool/matrix")
def invert_matrix(data: MatrixInput):
    print(f"[MCP-MATRIX] 📥 Request: {data.matrix}", file=sys.stdout, flush=True)
    try:
        a = np.array(data.matrix, dtype=float)
        if a.ndim != 2 or a.shape[0] != a.shape[1]:
            raise ValueError("Matrix must be 2D and square")
        inv = np.linalg.inv(a).tolist()
        return inv
    except Exception as e:
        print(f"[MCP-MATRIX] ❌ Error: {e}", file=sys.stdout, flush=True)
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=6101)
