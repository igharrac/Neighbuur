-- ══════════════════════════════════════════════════════════════
-- Local reviews & provider experience, stap 1: geografische context
-- op een boeking. Zonder dit is er geen betrouwbare manier om achteraf
-- te zeggen "deze afgeronde klus vond plaats in [gebied]" — community_id
-- wordt alleen gevuld bij community-deals, niet bij een gewone 1-op-1
-- boeking. Nullable en puur additief: gevuld bij aanmaak vanuit de
-- current_residence_id van de klant op dat moment (snapshot, want een
-- latere verhuizing mag de historische locatie van een oude klus niet
-- wijzigen).
-- ══════════════════════════════════════════════════════════════

alter table bookings add column residence_id uuid references residences(id);

create index if not exists idx_bookings_residence_id on bookings (residence_id);
