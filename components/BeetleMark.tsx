// The Urban Beetle logo. It is drawn as a CSS mask (public/brand/logo-mask.webp, cut from
// assets/logo-original.png) so it can be filled with the site's metallic gold and animated glint.
export default function BeetleMark({ className, title }: { className?: string; title?: string }) {
  return (
    <span
      className={className ? `logo-mark ${className}` : "logo-mark"}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    />
  );
}
