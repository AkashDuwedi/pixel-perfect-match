CREATE OR REPLACE FUNCTION public.get_my_school_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT p.school_id FROM public.profiles p
  JOIN public.schools s ON s.id = p.school_id
  WHERE p.id = auth.uid() AND s.is_active
$function$;