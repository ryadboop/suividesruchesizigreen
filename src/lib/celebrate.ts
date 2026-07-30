import confetti from "canvas-confetti";

const forest = ["#1f4a33", "#2f6b46", "#7aa87f"];
const honey = ["#f2b134", "#f7d488", "#e59b1e"];

export function celebrate() {
  const colors = [...forest, ...honey];
  const defaults = { spread: 70, ticks: 220, gravity: 0.9, scalar: 1, colors };

  confetti({ ...defaults, particleCount: 70, origin: { x: 0.5, y: 0.6 } });
  setTimeout(
    () => confetti({ ...defaults, particleCount: 45, angle: 60, origin: { x: 0.1, y: 0.7 } }),
    140,
  );
  setTimeout(
    () => confetti({ ...defaults, particleCount: 45, angle: 120, origin: { x: 0.9, y: 0.7 } }),
    240,
  );
}
