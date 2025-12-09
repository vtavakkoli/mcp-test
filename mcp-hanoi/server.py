from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import sys

class HanoiInput(BaseModel):
    n: int

app = FastAPI(title="Hanoi MCP")

def _hanoi(n, source, target, auxiliary, moves):
    if n <= 0: return
    _hanoi(n - 1, source, auxiliary, target, moves)
    moves.append(f"{source} -> {target}")
    _hanoi(n - 1, auxiliary, target, source, moves)

@app.post("/tool/hanoi")
def solve_hanoi(data: HanoiInput):
    n = data.n
    print(f"[MCP-HANOI] 📥 Request: N={n}", file=sys.stdout, flush=True)
    if n < 1:
        raise HTTPException(status_code=400, detail="N must be >= 1")
    moves = []
    _hanoi(n, "A", "C", "B", moves)
    return {"moves": moves, "count": len(moves)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=6102)
