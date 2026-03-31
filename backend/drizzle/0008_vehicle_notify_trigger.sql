CREATE OR REPLACE FUNCTION notify_vehicle_change()
RETURNS trigger AS $$
DECLARE
  payload jsonb;
BEGIN
  payload := jsonb_build_object(
    'event',  TG_OP,          -- 'INSERT' or 'UPDATE'
    'id',         NEW.id,
    'licensePlate', NEW.license_plate,
    'vehicleType',  NEW.vehicle_type,
    'entryTime',    NEW.entry_time,
    'exitTime',     NEW.exit_time,
    'imageUrl',     NEW.image_url,
    'totalAmount',  NEW.total_amount
  );
  PERFORM pg_notify('vehicle_events', payload::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER vehicle_change_trigger
AFTER INSERT OR UPDATE ON vehicle
FOR EACH ROW EXECUTE FUNCTION notify_vehicle_change();