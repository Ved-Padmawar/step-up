import confetti from "canvas-confetti";

export function fireActivityLogConfetti() {
  const colors = ["#0f6e56", "#f2b705", "#ffffff", "#0a5443"];

  confetti({
    particleCount: 90,
    spread: 72,
    startVelocity: 36,
    origin: { y: 0.62 },
    colors,
  });

  window.setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors,
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors,
    });
  }, 180);
}
