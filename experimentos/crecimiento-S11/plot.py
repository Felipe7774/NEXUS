"""Render conserved k6 summaries with matplotlib (pip install matplotlib)."""
import json
from pathlib import Path
import sys
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

folder = Path(sys.argv[1] if len(sys.argv) > 1 else "experimentos/crecimiento-S11/resultados/local-2026-10-17")
data = json.loads((folder / "summary.json").read_text(encoding="utf-8"))
levels = data["levels"]
x = [r["vus"] for r in levels]
fig, axes = plt.subplots(1, 3, figsize=(13, 4.3), layout="constrained")
for i in range(3):
    axes[0].plot(x, [r["runs"][i]["p95"] for r in levels], color="#a6b6c8", alpha=.6, linewidth=1)
axes[0].plot(x, [r["p95"] for r in levels], "o-", color="#075c91", label="Mediana de 3 p95")
axes[0].axhline(2000, color="#b82d2d", linestyle="--", label="Presupuesto: 2.000 ms")
axes[0].set_ylabel("Latencia p95 (ms)")
axes[0].legend(fontsize=8)
axes[1].plot(x, [100*r["errorRate"] for r in levels], "o-", color="#b82d2d")
axes[1].axhline(1, color="#666", linestyle="--", label="Límite: 1%")
axes[1].set_ylabel("Errores semánticos (%)")
axes[1].legend(fontsize=8)
y = [r["usefulPerScheduledSecond"] for r in levels]
low = [v * data["seconds"] / (data["seconds"] + 3) for v in y]
axes[2].fill_between(x, low, y, alpha=.2, color="#09866a", label="Duración efectiva: 30–33 s")
axes[2].plot(x, y, "o-", color="#09866a")
axes[2].set_ylabel("Operaciones útiles / segundo programado")
axes[2].legend(fontsize=8)
for ax in axes:
    ax.set_xlabel("Usuarios virtuales (VUs)")
    ax.set_xticks(x)
    ax.grid(alpha=.2)
    ax.set_ylim(bottom=0)
fig.suptitle("NEXUS · crecimiento local en Docker · calentamiento descartado, 3 corridas")
fig.savefig(folder / "crecimiento.png", dpi=170)
fig.savefig(folder / "crecimiento.svg")
