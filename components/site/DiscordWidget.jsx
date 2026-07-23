/**
 * Official Discord server widget embed.
 * Server must have Server Widget enabled in Discord → Server Settings → Widget.
 */
export function DiscordWidget({
  serverId,
  theme = "dark",
  title = "SookLabs Discord",
  width = 350,
  height = 500,
  className = "",
}) {
  if (!serverId) return null;

  const src = `https://discord.com/widget?id=${encodeURIComponent(serverId)}&theme=${encodeURIComponent(theme)}`;

  return (
    <iframe
      src={src}
      title={title}
      width={width}
      height={height}
      allowTransparency="true"
      frameBorder="0"
      sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
      className={className}
      loading="lazy"
    />
  );
}
