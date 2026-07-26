
create policy "studio media read own" on storage.objects for select to authenticated
  using (bucket_id = 'studio-media' and owner = auth.uid());
create policy "studio media insert own" on storage.objects for insert to authenticated
  with check (bucket_id = 'studio-media' and owner = auth.uid());
create policy "studio media update own" on storage.objects for update to authenticated
  using (bucket_id = 'studio-media' and owner = auth.uid());
create policy "studio media delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'studio-media' and owner = auth.uid());
