/**
 * The four "+" registration marks that every framed element in the Industry
 * design system wears. Drop inside any element that has the `blueprint` class
 * (see industry.css `.blueprint > .corner`).
 */
export function BlueprintCorners() {
  return (
    <>
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />
    </>
  );
}
