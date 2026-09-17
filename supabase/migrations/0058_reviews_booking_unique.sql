-- ══════════════════════════════════════════════════════════════
-- Local reviews & provider experience, stap 2: voorkom dubbele reviews
-- voor dezelfde boeking. booking_id blijft nullable (null = niet-
-- geverifieerde review, mag vrij vaker voorkomen) — de unieke index
-- geldt alleen waar booking_id gezet is.
-- ══════════════════════════════════════════════════════════════

create unique index reviews_booking_uniek on reviews (booking_id) where booking_id is not null;
