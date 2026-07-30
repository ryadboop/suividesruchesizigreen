import { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";

type Props = {
  value: number;
  format?: (n: number) => string;
  className?: string;
  duration?: number;
};

export function CountUp({ value, format = (n) => Math.round(n).toString(), className, duration = 1.2 }: Props) {
  const [display, setDisplay] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const controls = animate(from.current, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(latest),
    });
    from.current = value;
    return () => controls.stop();
  }, [value, duration]);

  return <span className={className}>{format(display)}</span>;
}
