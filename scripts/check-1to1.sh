#!/usr/bin/env bash
# Daily health check of the "Book a 1-1 with Aisha" flow. Exits non-zero if anything is broken.
# Checks: booking pages on the main site and portal, the Cal.com links each confirmed page uses,
# the Cal.com links the portal sends after payment, and that the portal checkout/return routes
# answer without a login and PayPal is configured. It never pays or emails anyone.
set -u
MAIN=https://monostechnology.co.uk
PORTAL=https://monos-portal.netlify.app
CAL=https://cal.com/aisha-monos-rv64et
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36"
FAIL=0
: > /tmp/slugs
ok(){ echo "PASS  $*"; }
bad(){ echo "FAIL  $*"; FAIL=1; }
get(){ curl -sS -L -A "$UA" -m 30 -o /tmp/body -w '%{http_code}' "$1" 2>/dev/null || echo 000; }

# 1. Booking pages load
for u in $MAIN/book-aisha $MAIN/book-aisha-clients $MAIN/book-aisha-confirmed $PORTAL/book-aisha $PORTAL/book-aisha-clients $PORTAL/book-aisha-confirmed; do
  c=$(get "$u"); [ "$c" = 200 ] && ok "$u ($c)" || bad "$u returned $c"
  case "$u" in *confirmed) ;; *) grep -q '/api/one-to-one/checkout' /tmp/body && ok "$u form posts to portal checkout" || bad "$u has no checkout form";; esac
  # 2. Every Cal.com slug a confirmed page uses must exist
  case "$u" in *confirmed)
    slugs=$(grep -o "var P={[^}]*}" /tmp/body | grep -oE "\['[a-z0-9-]+'" | tr -d "['" | sort -u)
    [ -n "$slugs" ] || bad "$u: no Cal.com links found"
    for s in $slugs; do echo "$s" >> /tmp/slugs; done;;
  esac
done

# 3. Cal.com links the portal sends people to after payment (from the live code on main)
curl -sS -m 30 https://raw.githubusercontent.com/MonosTeam/monos-portal/main/src/lib/one-to-one.ts | grep -o 'cal: "[^"?]*' | cut -d'"' -f2 >> /tmp/slugs
# Cal.com answers 404 for an event that doesn't exist (its "page does not exist" screen).
# Its pages always contain that text in their scripts, so the status code is what we check;
# a made-up slug must still give 404, proving the check can tell the difference.
c=$(get "$CAL/monos-healthcheck-no-such-event"); [ "$c" = 404 ] && ok "Cal.com reports missing events as 404" || bad "Cal.com check unreliable: unknown event gave $c"
for s in $(sort -u /tmp/slugs); do
  c=$(get "$CAL/$s")
  [ "$c" = 200 ] && ok "Cal.com $s" || bad "Cal.com $CAL/$s is broken ($c)"
done

# 4. Portal payment routes answer without a login
c=$(curl -sS -m 30 -o /dev/null -w '%{http_code} %{redirect_url}' -X POST -d product=new_20 "$PORTAL/api/one-to-one/checkout")
case "$c" in 303*error=missing*) ok "checkout route live, no login ($c)";; *) bad "checkout route: $c";; esac
c=$(curl -sS -m 30 -o /dev/null -w '%{http_code} %{redirect_url}' "$PORTAL/api/one-to-one/return?token=HEALTHCHECK")
case "$c" in 303*error=payment*) ok "PayPal return route live ($c)";; *) bad "return route: $c";; esac
h=$(curl -sS -m 30 "$PORTAL/api/pay/health")
echo "$h" | grep -q '"configured":true' && ok "PayPal keys configured" || bad "PayPal not configured: $h"

exit $FAIL
