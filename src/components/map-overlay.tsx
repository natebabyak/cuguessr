export function MapOverlay({
  children,
}: React.PropsWithChildren<React.HTMLProps<HTMLDivElement>>) {
  return (
    <div className="pointer-events-none absolute inset-2 *:pointer-events-auto *:absolute md:inset-4">
      {children}
    </div>
  );
}
