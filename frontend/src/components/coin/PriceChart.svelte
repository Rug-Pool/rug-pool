<script lang="ts">
  import { onDestroy } from 'svelte';
  import { createChart, type IChartApi, type ISeriesApi, type LineData, type Time } from 'lightweight-charts';

  let { data = [], pair = '' }: { data?: { time: number; price: number }[]; pair?: string } = $props();

  let containerEl: HTMLDivElement;
  let chart: IChartApi | null = null;
  let lineSeries: ISeriesApi<'Line'> | null = null;

  function initChart() {
    if (!containerEl || data.length < 2) return;

    if (chart) {
      chart.remove();
      chart = null;
      lineSeries = null;
    }

    containerEl.innerHTML = '';

    chart = createChart(containerEl, {
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#a1a1aa',
        fontSize: 11,
        fontFamily: 'JetBrains Mono, monospace',
      },
      grid: {
        vertLines: { color: '#27272a' },
        horzLines: { color: '#27272a' },
      },
      crosshair: {
        vertLine: { color: '#8b5cf6', width: 1, style: 2, labelBackgroundColor: '#8b5cf6' },
        horzLine: { color: '#8b5cf6', width: 1, style: 2, labelBackgroundColor: '#8b5cf6' },
      },
      rightPriceScale: {
        borderColor: '#3f3f46',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: '#3f3f46',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: false,
      handleScale: false,
      width: containerEl.clientWidth,
      height: containerEl.clientHeight,
    });

    lineSeries = chart.addLineSeries({
      color: '#8b5cf6',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      crosshairMarkerBorderColor: '#8b5cf6',
      crosshairMarkerBackgroundColor: '#8b5cf6',
      priceFormat: {
        type: 'custom',
        formatter: (price: number) => '$' + price.toFixed(6),
      },
    });

    const sorted = [...data].sort((a, b) => a.time - b.time);
    const seriesData: LineData[] = sorted.map((d) => ({
      time: Math.floor(d.time / 1000) as Time,
      value: d.price,
    }));
    lineSeries.setData(seriesData);
    chart.timeScale().fitContent();
  }

  function handleResize() {
    if (chart && containerEl) {
      chart.applyOptions({
        width: containerEl.clientWidth,
        height: containerEl.clientHeight,
      });
    }
  }

  $effect(() => {
    if (containerEl && data.length >= 2) {
      initChart();
    }
  });

  $effect(() => {
    if (containerEl) {
      const ro = new ResizeObserver(handleResize);
      ro.observe(containerEl);
      return () => ro.disconnect();
    }
  });

  onDestroy(() => {
    if (chart) {
      chart.remove();
      chart = null;
      lineSeries = null;
    }
  });
</script>

<div class="chart-container">
  <div class="chart-header">
    <span class="chart-pair">{pair || 'MON'}</span>
  </div>
  <div bind:this={containerEl} class="chart-box"></div>
</div>

<style>
  .chart-container {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .chart-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .chart-pair {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary);
    font-family: 'JetBrains Mono', monospace;
    padding: 0.125rem 0.5rem;
    border: 1px solid var(--gray-700);
    border-radius: 4px;
    background: var(--bg-primary);
  }

  .chart-box {
    width: 100%;
    height: 300px;
    min-height: 250px;
    position: relative;
    overflow: hidden;
  }
</style>
