CREATE POLICY badges_public_read ON badges
  FOR SELECT
  USING (TRUE);
