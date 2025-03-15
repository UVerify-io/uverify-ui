export function applyOpacity(color: string, opacity?: number) {
  if (!opacity || opacity === 100) {
    return color;
  }
  return `${color}/${opacity}`;
}
