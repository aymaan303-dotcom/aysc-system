do $$
declare t text;
begin
  foreach t in array array[
    'branches','roles','employees','products','customers','suppliers',
    'sales','sale_items','purchases','purchase_items',
    'manufacturing_orders','manufacturing_materials',
    'attendance','advances','banks','bank_transactions','role_permissions'
  ]
  loop
    execute format('alter table %I enable row level security', t);
    begin
      execute format('create policy "auth_select_%s" on %I for select using (auth.role() = ''authenticated'')', t, t);
    exception when duplicate_object then null; end;
    begin
      execute format('create policy "auth_insert_%s" on %I for insert with check (auth.role() = ''authenticated'')', t, t);
    exception when duplicate_object then null; end;
    begin
      execute format('create policy "auth_update_%s" on %I for update using (auth.role() = ''authenticated'')', t, t);
    exception when duplicate_object then null; end;
    begin
      execute format('create policy "auth_delete_%s" on %I for delete using (auth.role() = ''authenticated'')', t, t);
    exception when duplicate_object then null; end;
  end loop;
end;
$$;
