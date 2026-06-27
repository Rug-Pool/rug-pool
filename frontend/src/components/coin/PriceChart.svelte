<script lang="ts">
  let { data = [] }: { data?: { time: number; price: number }[] } = $props();

  let canvasEl: HTMLCanvasElement;
  let tooltip = $state<{ x: number; y: number; price: string; time: string } | null>(null);

  $effect(() => {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx || data.length < 2) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvasEl.getBoundingClientRect();
    canvasEl.width = rect.width * dpr;
    canvasEl.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const pad = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    const prices = data.map((d) => d.price);
    const minP = Math.min(...prices) * 0.995;
    const maxP = Math.max(...prices) * 1.005;
    const range = maxP - minP || 1;

    const xs = (i: number) => pad.left + (i / (data.length - 1)) * chartW;
    const ys = (p: number) => pad.top + chartH - ((p - minP) / range) * chartH;

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = xs(i);
      const y = ys(d.price);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.fillStyle = gradient;
    ctx.lineTo(xs(data.length - 1), pad.top + chartH);
    ctx.lineTo(xs(0), pad.top + chartH);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#52525b';
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    const labelCount = Math.min(5, data.length);
    const step = Math.floor((data.length - 1) / (labelCount - 1));
    for (let i = 0; i < labelCount; i++) {
      const idx = Math.min(i * step, data.length - 1);
      const t = new Date(data[idx].time);
      ctx.fillText(`${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`, xs(idx), h - 8);
    }

    ctx.textAlign = 'right';
    ctx.fillStyle = '#52525b';
    const yLabels = [minP, (minP + maxP) / 2, maxP];
    yLabels.forEach((p) => {
      ctx.fillText('$' + p.toFixed(6), pad.left - 8, ys(p) + 4);
    });
  });
</script>

<div class="chart-wrapper">
  <canvas bind:this={canvasEl} class="chart"></canvas>
</div>

<style>
  .chart-wrapper {
    width: 100%;
    height: 100%;
    min-height: 250px;
  }

  .chart {
    width: 100%;
    height: 100%;
    min-height: 250px;
  }
</style>
