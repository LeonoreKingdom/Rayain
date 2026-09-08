-- Custom SQL migration file, put your code below! --
INSERT OR IGNORE INTO `music` (`id`, `title`, `artist`, `mood`, `duration`, `audio_url`, `preview_url`, `is_active`) VALUES
  ('first-dance', 'First Dance', 'The Rayain Library', 'Romantic & warm', '03:24', NULL, NULL, 1),
  ('morning-light', 'Morning Light', 'The Rayain Library', 'Soft & hopeful', '02:48', NULL, NULL, 1),
  ('garden-notes', 'Garden Notes', 'The Rayain Library', 'Intimate & calm', '03:07', NULL, NULL, 1);
