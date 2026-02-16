-- Création du bucket pour les sauvegardes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('backups', 'backups', false)
ON CONFLICT (id) DO NOTHING;

-- Politiques de sécurité pour le bucket backups
-- Seuls les administrateurs (ou via service role) devraient y accéder, 
-- mais pour faciliter la gestion via l'interface, on permet la lecture si besoin.
CREATE POLICY "Admin can manage backups" ON storage.objects
  FOR ALL USING (bucket_id = 'backups');