CREATE POLICY quests_public_read ON quests
  FOR SELECT
  USING (is_active = TRUE);
