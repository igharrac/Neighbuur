-- ══════════════════════════════════════════════════════════════
-- Naming-migratie, Fase 3 (enum): notificatie_type → notification_type.
-- ALTER TYPE ... RENAME VALUE migreert bestaande data automatisch.
-- "review" en "premium" blijven ongewijzigd (al Engels).
-- ══════════════════════════════════════════════════════════════

alter type notificatie_type rename to notification_type;
alter type notification_type rename value 'boeking' to 'booking';
alter type notification_type rename value 'bericht' to 'message';
alter type notification_type rename value 'uitnodiging' to 'invitation';
alter type notification_type rename value 'groepskorting' to 'group_discount';
alter type notification_type rename value 'systeem' to 'system';
