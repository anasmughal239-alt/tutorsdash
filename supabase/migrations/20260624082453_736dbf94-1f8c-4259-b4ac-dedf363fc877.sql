
CREATE POLICY "public read materials" ON storage.objects FOR SELECT USING (bucket_id = 'materials');
CREATE POLICY "public insert materials" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'materials');
CREATE POLICY "public update materials" ON storage.objects FOR UPDATE USING (bucket_id = 'materials');
CREATE POLICY "public delete materials" ON storage.objects FOR DELETE USING (bucket_id = 'materials');
