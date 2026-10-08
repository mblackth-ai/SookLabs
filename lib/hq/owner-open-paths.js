/** Owner pages and the two routes that check the cookie or one-time link themselves.
 * Every other /hq/api/client route stays behind Mark's HQ session.
 */
export function isOwnerPublicPath(pathname) {
  return (
    pathname === "/hq/client" ||
    pathname.startsWith("/hq/client/") ||
    pathname === "/hq/api/client/redeem" ||
    pathname === "/hq/api/client/logout"
  );
}
