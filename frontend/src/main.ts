import './app.css';
import App from './App.svelte';
import { mount } from 'svelte';

const app = mount(App, {
  target: document.getElementById('app')!,
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

export default app;
